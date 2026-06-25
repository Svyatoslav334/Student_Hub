import { useState, useRef, useCallback, useEffect } from 'react';
import { api } from '../../services/api';
import { toast } from 'sonner';
import {
  Save, Trash2, MousePointer, Square, Minus, Eraser,
  Image, Undo2, Redo2, ZoomIn, ZoomOut, Move, Grid,
  Download, Eye, EyeOff, Lock, Unlock, ChevronDown,
} from 'lucide-react';


type Tool = 'select' | 'room' | 'corridor' | 'wall' | 'erase' | 'pan';
type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

interface Room {
  id: number;
  x: number; y: number; w: number; h: number;
  label: string;
  type: 'room' | 'corridor';
  locked?: boolean;
}

interface Wall {
  id: number;
  x1: number; y1: number; x2: number; y2: number;
}

interface Drawing {
  x1: number; y1: number; x2: number; y2: number;
}

interface HistoryState {
  rooms: Room[];
  walls: Wall[];
}


const CANVAS_W = 1280;
const CANVAS_H = 1280;
const GRID_SIZE = 20;
const FLOOR_OPTIONS = [1, 2, 3, 4, 5];
const MAX_HISTORY = 50;
const MIN_SIZE = 10;
const HANDLE_SIZE = 8; 


function buildSVG(rooms: Room[], walls: Wall[]): string {
  const rects = rooms.map(r => {
    const fill = r.type === 'room' ? '#e8f4f8' : '#fdf6e3';
    const stroke = r.type === 'room' ? '#334155' : '#b8a87a';
    const sw = r.type === 'room' ? 2 : 1.5;
    const dash = r.type === 'corridor' ? ' stroke-dasharray="6,3"' : '';
    const textFill = r.type === 'room' ? '#1a4a6b' : '#7a6030';
    const fontSize = Math.min(14, Math.max(9, Math.floor(Math.min(r.w, r.h) / 4)));
    return ` <rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${dash}/>
  <text x="${r.x + Math.round(r.w / 2)}" y="${r.y + Math.round(r.h / 2) + Math.floor(fontSize / 3)}" text-anchor="middle" font-size="${fontSize}" font-family="monospace" fill="${textFill}" font-weight="600">${r.label}</text>`;
  }).join('\n');

  const lines = walls.map(w =>
    ` <line x1="${w.x1}" y1="${w.y1}" x2="${w.x2}" y2="${w.y2}" stroke="#334155" stroke-width="4" stroke-linecap="round"/>`
  ).join('\n');

  return `<svg viewBox="0 0 ${CANVAS_W} ${CANVAS_H}" xmlns="http://www.w3.org/2000/svg" width="${CANVAS_W}" height="${CANVAS_H}">\n${rects}\n${lines}\n</svg>`;
}


function buildRoomsJSON(rooms: Room[]) {
  return rooms.map((r, i) => ({
    id: i + 1,
    name: r.label,
    label: r.label,
    type: r.type,
    x: r.x,
    y: r.y,
    width: r.w,
    height: r.h,
    doorX: r.x + Math.round(r.w / 2),
    doorY: r.y + r.h,
  }));
}

function snapToGrid(v: number): number {
  return Math.round(v / GRID_SIZE) * GRID_SIZE;
}


const HANDLE_CURSORS: Record<ResizeHandle, string> = {
  nw: 'nw-resize', n: 'n-resize', ne: 'ne-resize',
  e: 'e-resize', se: 'se-resize', s: 's-resize',
  sw: 'sw-resize', w: 'w-resize',
};


const MapEditor = () => {
  const [tool, setTool] = useState<Tool>('room');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [walls, setWalls] = useState<Wall[]>([]);
  const [drawing, setDrawing] = useState<Drawing | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [labelInput, setLabelInput] = useState('');
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [bgOpacity, setBgOpacity] = useState(0.3);
  const [floor, setFloor] = useState(1);
  const [mapName, setMapName] = useState('Поверх 1');
  const [saving, setSaving] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [snapGrid, setSnapGrid] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState<HistoryState[]>([{ rooms: [], walls: [] }]);
  const [histIdx, setHistIdx] = useState(0);
  const [roomCounter, setRoomCounter] = useState(200);
  const [showPreview, setShowPreview] = useState(false);

  
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  
  const [resizingHandle, setResizingHandle] = useState<ResizeHandle | null>(null);
  const [resizeOrigin, setResizeOrigin] = useState<Room | null>(null); 

  const [mapsList, setMapsList] = useState<any[]>([]);
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [currentMapId, setCurrentMapId] = useState<number | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const labelRef = useRef<HTMLInputElement>(null);

  const loadMapsList = async () => {
    try {
      const res = await api.get('/maps');
      setMapsList(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadMap = async (mapId: number) => {
    try {
      const res = await api.get(`/maps/${mapId}`);
      const map = res.data;

      setRooms(map.rooms || []);
      setWalls(map.walls || []);
      setFloor(map.floor || 1);
      setMapName(map.name || `Поверх ${map.floor}`);
      setCurrentMapId(map.id);
      setIsEditingExisting(true);

      setHistory([{ rooms: map.rooms || [], walls: map.walls || [] }]);
      setHistIdx(0);
      setSelectedId(null);
      setEditingId(null);

      toast.success(`Завантажено: ${map.name}`);
    } catch (err) {
      toast.error('Не вдалося завантажити карту');
    }
  };

  useEffect(() => {
    loadMapsList();
  }, []);

  useEffect(() => {
    if (editingId && labelRef.current) {
      setTimeout(() => labelRef.current?.focus(), 50);
    }
  }, [editingId]);

  
  const pushHistory = useCallback((r: Room[], w: Wall[]) => {
    setHistory(prev => {
      const cut = prev.slice(0, histIdx + 1);
      return [...cut, { rooms: r, walls: w }].slice(-MAX_HISTORY);
    });
    setHistIdx(prev => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [histIdx]);

  const undo = useCallback(() => {
    if (histIdx <= 0) return;
    const state = history[histIdx - 1];
    setRooms(state.rooms); setWalls(state.walls);
    setHistIdx(histIdx - 1);
    setSelectedId(null); setEditingId(null);
  }, [histIdx, history]);

  const redo = useCallback(() => {
    if (histIdx >= history.length - 1) return;
    const state = history[histIdx + 1];
    setRooms(state.rooms); setWalls(state.walls);
    setHistIdx(histIdx + 1);
  }, [histIdx, history]);

  
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId) {
          const nr = rooms.filter(r => r.id !== selectedId);
          setRooms(nr); pushHistory(nr, walls);
          setSelectedId(null); setEditingId(null);
        }
      }
      if (e.key === 'Escape') { setSelectedId(null); setEditingId(null); setDrawing(null); }
      if (!e.ctrlKey && !e.metaKey) {
        if (e.key === 'r') setTool('room');
        if (e.key === 'c') setTool('corridor');
        if (e.key === 'w') setTool('wall');
        if (e.key === 'e') setTool('erase');
        if (e.key === 'v') setTool('select');
        if (e.key === 'h') setTool('pan');
      }
      
      if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key) && selectedId) {
        const step = e.shiftKey ? GRID_SIZE : 1;
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
        setRooms(prev => {
          const nr = prev.map(r => r.id === selectedId && !r.locked
            ? { ...r, x: Math.max(0, r.x + dx), y: Math.max(0, r.y + dy) }
            : r
          );
          pushHistory(nr, walls);
          return nr;
        });
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, selectedId, rooms, walls, pushHistory]);

  
  const toSVGPoint = useCallback((e: React.MouseEvent, snap = true): { x: number; y: number } => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const raw = {
      x: (e.clientX - rect.left) * (CANVAS_W / rect.width),
      y: (e.clientY - rect.top) * (CANVAS_H / rect.height),
    };
    return (snap && snapGrid)
      ? { x: snapToGrid(raw.x), y: snapToGrid(raw.y) }
      : { x: Math.round(raw.x), y: Math.round(raw.y) };
  }, [snapGrid]);

  
  const onHandleMouseDown = useCallback((e: React.MouseEvent, handle: ResizeHandle) => {
    e.stopPropagation();
    const room = rooms.find(r => r.id === selectedId);
    if (!room || room.locked) return;
    setResizingHandle(handle);
    setResizeOrigin({ ...room });
  }, [rooms, selectedId]);

  
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const pt = toSVGPoint(e);

    if (tool === 'pan') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (tool === 'erase') {
      const nr = rooms.filter(r => !(pt.x >= r.x && pt.x <= r.x + r.w && pt.y >= r.y && pt.y <= r.y + r.h));
      const nw = walls.filter(w => {
        const dx = w.x2 - w.x1, dy = w.y2 - w.y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len === 0) return true;
        const t = Math.max(0, Math.min(1, ((pt.x - w.x1) * dx + (pt.y - w.y1) * dy) / (len * len)));
        const dist = Math.sqrt((pt.x - w.x1 - t * dx) ** 2 + (pt.y - w.y1 - t * dy) ** 2);
        return dist > 10;
      });
      if (nr.length !== rooms.length || nw.length !== walls.length) {
        setRooms(nr); setWalls(nw); pushHistory(nr, nw);
      }
      return;
    }

    if (tool === 'select') {
      const found = [...rooms].reverse().find(r =>
        pt.x >= r.x && pt.x <= r.x + r.w && pt.y >= r.y && pt.y <= r.y + r.h
      );
      if (found) {
        if (found.locked) { setSelectedId(found.id); return; }
        setSelectedId(found.id);
        setIsDragging(true);
        setDragOffset({ x: pt.x - found.x, y: pt.y - found.y });
      } else {
        setSelectedId(null);
        setEditingId(null);
      }
      return;
    }

    setDrawing({ x1: pt.x, y1: pt.y, x2: pt.x, y2: pt.y });
  }, [tool, rooms, walls, toSVGPoint, pushHistory, pan]);

  
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (tool === 'pan' && isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      return;
    }

    
    if (resizingHandle && resizeOrigin && selectedId) {
      const pt = toSVGPoint(e);
      const o = resizeOrigin;
      let { x, y, w, h } = o;

      if (resizingHandle.includes('e')) w = Math.max(MIN_SIZE, pt.x - o.x);
      if (resizingHandle.includes('s')) h = Math.max(MIN_SIZE, pt.y - o.y);
      if (resizingHandle.includes('w')) {
        const newX = Math.min(pt.x, o.x + o.w - MIN_SIZE);
        w = o.x + o.w - newX;
        x = newX;
      }
      if (resizingHandle.includes('n')) {
        const newY = Math.min(pt.y, o.y + o.h - MIN_SIZE);
        h = o.y + o.h - newY;
        y = newY;
      }

      setRooms(prev => prev.map(r => r.id === selectedId ? { ...r, x, y, w, h } : r));
      return;
    }

    
    if (tool === 'select' && isDragging && selectedId) {
      const pt = toSVGPoint(e);
      setRooms(prev => prev.map(r =>
        r.id === selectedId && !r.locked
          ? { ...r, x: Math.max(0, pt.x - dragOffset.x), y: Math.max(0, pt.y - dragOffset.y) }
          : r
      ));
      return;
    }

    if (!drawing) return;
    const pt = toSVGPoint(e);
    setDrawing(prev => prev ? { ...prev, x2: pt.x, y2: pt.y } : null);
  }, [tool, isPanning, panStart, resizingHandle, resizeOrigin, selectedId, isDragging, dragOffset, drawing, toSVGPoint]);

  
  const onMouseUp = useCallback(() => {
    if (isPanning) { setIsPanning(false); return; }

    if (resizingHandle) {
      setResizingHandle(null);
      setResizeOrigin(null);
      pushHistory(rooms, walls);
      return;
    }

    if (isDragging) {
      setIsDragging(false);
      pushHistory(rooms, walls);
      return;
    }

    if (!drawing) return;

    const x = Math.min(drawing.x1, drawing.x2);
    const y = Math.min(drawing.y1, drawing.y2);
    const w = Math.abs(drawing.x2 - drawing.x1);
    const h = Math.abs(drawing.y2 - drawing.y1);

    if (tool === 'wall') {
      if (w > 5 || h > 5) {
        const nw = [...walls, { id: Date.now(), x1: drawing.x1, y1: drawing.y1, x2: drawing.x2, y2: drawing.y2 }];
        setWalls(nw); pushHistory(rooms, nw);
      }
    } else if ((tool === 'room' || tool === 'corridor') && w > 10 && h > 10) {
      const id = Date.now();
      const nextNum = roomCounter + 1;
      setRoomCounter(nextNum);
      const label = tool === 'room' ? String(nextNum) : 'Коридор';
      const nr = [...rooms, { id, x, y, w, h, label, type: tool as 'room' | 'corridor' }];
      setRooms(nr); pushHistory(nr, walls);
      if (tool === 'room') {
        setSelectedId(id);
        setEditingId(id);
        setLabelInput(label);
      }
    }

    setDrawing(null);
  }, [isPanning, resizingHandle, isDragging, drawing, tool, walls, rooms, roomCounter, pushHistory]);

  
  const applyLabel = () => {
    if (!editingId) return;
    const nr = rooms.map(r => r.id === editingId ? { ...r, label: labelInput } : r);
    setRooms(nr); pushHistory(nr, walls);
    setEditingId(null);
  };

  const toggleLock = (id: number) => {
    const nr = rooms.map(r => r.id === id ? { ...r, locked: !r.locked } : r);
    setRooms(nr);
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    const nr = rooms.filter(r => r.id !== selectedId);
    setRooms(nr); pushHistory(nr, walls);
    setSelectedId(null); setEditingId(null);
  };

  
  const updateRoomField = (field: 'x' | 'y' | 'w' | 'h', value: number) => {
    if (!selectedId) return;
    const nr = rooms.map(r => r.id === selectedId ? { ...r, [field]: Math.max(field === 'w' || field === 'h' ? MIN_SIZE : 0, value) } : r);
    setRooms(nr);
  };

  const commitRoomField = () => pushHistory(rooms, walls);

  
  const switchType = (type: 'room' | 'corridor') => {
    if (!selectedId) return;
    const nr = rooms.map(r => r.id === selectedId ? { ...r, type } : r);
    setRooms(nr); pushHistory(nr, walls);
  };

  
  const handleSave = async () => {
    if (rooms.length === 0 && walls.length === 0) {
      toast.error('Карта порожня — намалюй хоч одну кімнату');
      return;
    }

    setSaving(true);
    try {
      const svgData = buildSVG(rooms, walls);

      if (isEditingExisting && currentMapId) {
        await api.put(`/maps/${currentMapId}`, {
          floor,
          name: mapName,
          svgData,
          rooms,
          walls
        });
        toast.success('Карту успішно оновлено!');
      } else {
        await api.post('/map', {
          floor,
          name: mapName,
          svgData,
          rooms,
          walls
        });
        toast.success(`Карту "${mapName}" збережено!`);
        setIsEditingExisting(false);
        setCurrentMapId(null);
      }

      loadMapsList();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Помилка збереження');
    } finally {
      setSaving(false);
    }
  };

  const startNewMap = () => {
    setRooms([]);
    setWalls([]);
    setIsEditingExisting(false);
    setCurrentMapId(null);
    setMapName(`Поверх ${floor}`);
    setHistory([{ rooms: [], walls: [] }]);
    setHistIdx(0);
    setSelectedId(null);
    setEditingId(null);
  };

  const handleExport = () => {
    const svg = buildSVG(rooms, walls);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `${mapName}.svg`; a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    if (!confirm('Очистити всю карту?')) return;
    setRooms([]); setWalls([]); setSelectedId(null); setEditingId(null);
    setRoomCounter(200); setHistory([{ rooms: [], walls: [] }]); setHistIdx(0);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(prev => Math.max(0.4, Math.min(3, prev - e.deltaY * 0.001)));
  };

  
  const renderResizeHandles = (r: Room) => {
    const hs = HANDLE_SIZE;
    const handles: { handle: ResizeHandle; cx: number; cy: number }[] = [
      { handle: 'nw', cx: r.x,           cy: r.y },
      { handle: 'n',  cx: r.x + r.w / 2, cy: r.y },
      { handle: 'ne', cx: r.x + r.w,     cy: r.y },
      { handle: 'e',  cx: r.x + r.w,     cy: r.y + r.h / 2 },
      { handle: 'se', cx: r.x + r.w,     cy: r.y + r.h },
      { handle: 's',  cx: r.x + r.w / 2, cy: r.y + r.h },
      { handle: 'sw', cx: r.x,           cy: r.y + r.h },
      { handle: 'w',  cx: r.x,           cy: r.y + r.h / 2 },
    ];
    return handles.map(({ handle, cx, cy }) => (
      <rect
        key={handle}
        x={cx - hs / 2} y={cy - hs / 2}
        width={hs} height={hs}
        fill="white" stroke="#0ea5e9" strokeWidth={1.5}
        rx={2}
        style={{ cursor: HANDLE_CURSORS[handle] }}
        onMouseDown={e => onHandleMouseDown(e, handle)}
      />
    ));
  };

  
  const getCursor = () => {
    if (resizingHandle) return HANDLE_CURSORS[resizingHandle];
    return {
      select: isDragging ? 'grabbing' : 'default',
      room: 'crosshair', corridor: 'crosshair', wall: 'crosshair',
      erase: 'cell',
      pan: isPanning ? 'grabbing' : 'grab',
    }[tool];
  };

  const previewRect = drawing && (tool === 'room' || tool === 'corridor') ? {
    x: Math.min(drawing.x1, drawing.x2),
    y: Math.min(drawing.y1, drawing.y2),
    w: Math.abs(drawing.x2 - drawing.x1),
    h: Math.abs(drawing.y2 - drawing.y1),
  } : null;

  const selectedRoom = rooms.find(r => r.id === selectedId);

  const toolList: { id: Tool; icon: React.ReactNode; label: string; key: string }[] = [
    { id: 'select',   icon: <MousePointer size={15} />, label: 'Вибір',    key: 'V' },
    { id: 'room',     icon: <Square size={15} />,       label: 'Кімната',  key: 'R' },
    { id: 'corridor', icon: <Grid size={15} />,         label: 'Коридор',  key: 'C' },
    { id: 'wall',     icon: <Minus size={15} />,        label: 'Стіна',    key: 'W' },
    { id: 'erase',    icon: <Eraser size={15} />,       label: 'Стерти',   key: 'E' },
    { id: 'pan',      icon: <Move size={15} />,         label: 'Рух',      key: 'H' },
  ];

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      <div className="flex items-center justify-between px-5 py-3 bg-slate-950 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-lg font-bold text-slate-100">Редактор карти</h1>
                  <p className="text-xs text-slate-500">
                    {isEditingExisting ? 'Редагування збереженої карти' : 'Нова карта'}
                  </p>
                </div>
      
                <div className="flex items-center gap-2">
                  <select value={floor} onChange={e => { setFloor(Number(e.target.value)); setMapName(`Поверх ${e.target.value}`); }}
                    className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200">
                    {FLOOR_OPTIONS.map(f => <option key={f} value={f}>{f}-й поверх</option>)}
                  </select>
                  <input value={mapName} onChange={e => setMapName(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 w-52" />
                </div>
              </div>
      
              <div className="flex items-center gap-3">
                <select onChange={e => e.target.value && loadMap(Number(e.target.value))} className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm">
                  <option value="">— Завантажити карту —</option>
                  {mapsList.map(m => (
                    <option key={m.id} value={m.id}>{m.name} (Поверх {m.floor})</option>
                  ))}
                </select>
      
                <button onClick={startNewMap} className="px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition">
                  Нова карта
                </button>
      
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl transition disabled:opacity-50">
                  <Save size={16} />
                  {saving ? 'Збереження...' : isEditingExisting ? 'Оновити' : 'Зберегти'}
                </button>
              </div>
            </div>

        <div className="flex items-center gap-2">
          <button onClick={undo} disabled={histIdx <= 0}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 transition" title="Скасувати (Ctrl+Z)">
            <Undo2 size={16} />
          </button>
          <button onClick={redo} disabled={histIdx >= history.length - 1}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 transition" title="Повторити (Ctrl+Y)">
            <Redo2 size={16} />
          </button>

          <div className="w-px h-6 bg-slate-700 mx-1" />

          <button onClick={() => setShowGrid(v => !v)}
            className={`p-2 rounded-xl transition ${showGrid ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-400 hover:bg-slate-800'}`} title="Сітка">
            <Grid size={16} />
          </button>
          <button onClick={() => setShowPreview(v => !v)}
            className={`p-2 rounded-xl transition ${showPreview ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-400 hover:bg-slate-800'}`} title="Прев'ю SVG">
            {showPreview ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>

          <div className="w-px h-6 bg-slate-700 mx-1" />

          <button onClick={() => setZoom(v => Math.min(3, v + 0.2))}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-800 transition"><ZoomIn size={16} /></button>
          <span className="text-xs text-slate-500 w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(v => Math.max(0.4, v - 0.2))}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-800 transition"><ZoomOut size={16} /></button>
          <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
            className="text-xs text-slate-500 hover:text-slate-300 px-2 py-1 rounded-lg hover:bg-slate-800 transition">1:1</button>

          <div className="w-px h-6 bg-slate-700 mx-1" />

          <button onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-700 text-slate-300 text-sm hover:bg-slate-800 transition">
            <Download size={14} />SVG
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl text-sm transition disabled:opacity-50">
            <Save size={14} />
            {saving ? 'Збереження...' : 'Зберегти'}
          </button>
        </div>
      </div>

      
      <div className="flex flex-1 min-h-0 overflow-hidden">

        
        <div className="w-52 shrink-0 flex flex-col gap-3 p-3 bg-slate-950 border-r border-slate-800 overflow-y-auto">

          
          <div>
            <p className="text-[10px] text-slate-600 font-bold tracking-widest mb-2 px-1">ІНСТРУМЕНТИ</p>
            <div className="space-y-0.5">
              {toolList.map(t => (
                <button key={t.id} onClick={() => setTool(t.id)}
                  className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-sm transition ${
                    tool === t.id
                      ? 'bg-cyan-500 text-black font-bold'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}>
                  <span className="flex items-center gap-2">{t.icon}{t.label}</span>
                  <span className={`text-[10px] font-mono px-1 py-0.5 rounded ${
                    tool === t.id ? 'bg-black/20 text-black' : 'text-slate-600'
                  }`}>{t.key}</span>
                </button>
              ))}
            </div>
          </div>

          
          <button onClick={() => setSnapGrid(v => !v)}
            className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-sm transition ${
              snapGrid ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'text-slate-500 hover:bg-slate-800'
            }`}>
            <span className="flex items-center gap-2"><Grid size={13} />Snap до сітки</span>
            <span className={`w-2.5 h-2.5 rounded-full ${snapGrid ? 'bg-violet-400' : 'bg-slate-700'}`} />
          </button>

          
          {selectedRoom && (
            <div className="bg-slate-900 border border-cyan-500/30 rounded-xl p-3 space-y-2.5">
              <p className="text-[10px] text-slate-500 font-bold tracking-widest">ВИБРАНО</p>

              
              {editingId === selectedRoom.id ? (
                <div>
                  <input
                    ref={labelRef}
                    value={labelInput}
                    onChange={e => setLabelInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && applyLabel()}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                  <button onClick={applyLabel}
                    className="w-full mt-1.5 bg-cyan-500 text-black font-bold rounded-lg py-1 text-xs">
                    ↵ Застосувати
                  </button>
                </div>
              ) : (
                <button onClick={() => { setEditingId(selectedRoom.id); setLabelInput(selectedRoom.label); }}
                  className="w-full text-left px-2 py-1.5 rounded-lg bg-slate-800 text-sm text-slate-200 hover:bg-slate-700 transition truncate">
                  {selectedRoom.label}
                </button>
              )}

              
              <div className="flex gap-1">
                {(['room', 'corridor'] as const).map(t => (
                  <button key={t}
                    onClick={() => switchType(t)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                      selectedRoom.type === t
                        ? t === 'room'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                    }`}>
                    {t === 'room' ? 'Кімната' : 'Коридор'}
                  </button>
                ))}
              </div>

              
              <div className="grid grid-cols-2 gap-1.5">
                {(['x', 'y', 'w', 'h'] as const).map(field => (
                  <label key={field} className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-slate-600 uppercase tracking-wider">{field}</span>
                    <input
                      type="number"
                      value={selectedRoom[field]}
                      step={GRID_SIZE}
                      min={field === 'w' || field === 'h' ? MIN_SIZE : 0}
                      onChange={e => updateRoomField(field, Number(e.target.value))}
                      onBlur={commitRoomField}
                      onKeyDown={e => e.key === 'Enter' && commitRoomField()}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 w-full"
                    />
                  </label>
                ))}
              </div>

              
              <div className="flex gap-1.5">
                <button onClick={() => toggleLock(selectedRoom.id)}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs transition ${
                    selectedRoom.locked
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}>
                  {selectedRoom.locked ? <Lock size={11} /> : <Unlock size={11} />}
                  {selectedRoom.locked ? 'Заблок.' : 'Блок'}
                </button>
                <button onClick={deleteSelected}
                  className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition">
                  <Trash2 size={13} />
                </button>
              </div>

              <p className="text-[10px] text-slate-600">
                ↑↓←→ переміщення · Shift+стрілки = {GRID_SIZE}px
              </p>
            </div>
          )}

          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
            <p className="text-[10px] text-slate-600 font-bold tracking-widest mb-2">ПІДКЛАДКА</p>
            <button onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 w-full px-2 py-2 rounded-lg border border-dashed border-slate-700 text-slate-500 text-xs hover:border-slate-500 hover:text-slate-300 transition">
              <Image size={12} />
              {bgImage ? 'Змінити фото' : 'Завантажити фото'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) setBgImage(URL.createObjectURL(f)); }} />
            {bgImage && (
              <div className="mt-2 space-y-1.5">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Прозорість</span><span>{Math.round(bgOpacity * 100)}%</span>
                </div>
                <input type="range" min={0} max={1} step={0.05} value={bgOpacity}
                  onChange={e => setBgOpacity(Number(e.target.value))} className="w-full accent-cyan-500 h-1" />
                <button onClick={() => setBgImage(null)}
                  className="text-xs text-slate-600 hover:text-red-400 transition">✕ Видалити</button>
              </div>
            )}
          </div>

          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs space-y-1.5">
            <p className="text-[10px] text-slate-600 font-bold tracking-widest mb-1">СТАТИСТИКА</p>
            <div className="flex justify-between text-slate-400">
              <span>Кімнат</span><span className="text-cyan-400 font-mono">{rooms.filter(r => r.type === 'room').length}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Коридорів</span><span className="text-amber-400 font-mono">{rooms.filter(r => r.type === 'corridor').length}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Стін</span><span className="text-slate-300 font-mono">{walls.length}</span>
            </div>
          </div>

          <button onClick={clearAll}
            className="flex items-center gap-2 justify-center w-full px-3 py-2 rounded-xl border border-red-500/20 text-red-400 text-xs hover:bg-red-500/10 transition mt-auto">
            <Trash2 size={12} />Очистити все
          </button>
        </div>

        
        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden bg-slate-950">

          
          <div className="px-4 py-1.5 border-b border-slate-800/50 flex items-center justify-between shrink-0">
            <p className="text-xs text-slate-600">
              {{
                select: '↖ Клікни → вибір · Тягни → переміщення · Хендли → resize · Del → видалити',
                room: '⬜ Тягни → намалюй кімнату',
                corridor: '▭ Тягни → намалюй коридор',
                wall: '━ Тягни → намалюй стіну',
                erase: '✕ Клікни → видалити',
                pan: '✋ Тягни → переміщення · Scroll → зум',
              }[tool]}
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <span>{CANVAS_W}×{CANVAS_H}</span>
              {drawing && (tool === 'room' || tool === 'corridor') && (
                <span className="text-cyan-500 font-mono">
                  {Math.abs(drawing.x2 - drawing.x1)}×{Math.abs(drawing.y2 - drawing.y1)}
                </span>
              )}
              {selectedRoom && (
                <span className="text-slate-500 font-mono">
                  {selectedRoom.x},{selectedRoom.y} · {selectedRoom.w}×{selectedRoom.h}
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-hidden relative bg-[#0f1117]"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: '24px 24px' }}>
            <div
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
                transition: isPanning ? 'none' : undefined,
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <svg
                ref={svgRef}
                viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
                width={CANVAS_W}
                height={CANVAS_H}
                style={{
                  display: 'block',
                  background: '#ffffff',
                  cursor: getCursor(),
                  maxWidth: '100%',
                  boxShadow: '0 0 0 1px rgba(100,116,139,0.3), 0 20px 60px rgba(0,0,0,0.5)',
                  userSelect: 'none',
                }}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
                onWheel={handleWheel}
              >
                {bgImage && (
                  <image href={bgImage} x={0} y={0} width={CANVAS_W} height={CANVAS_H}
                    opacity={bgOpacity} preserveAspectRatio="xMidYMid meet" />
                )}

                {showGrid && (
                  <>
                    <defs>
                      <pattern id="grid-minor" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
                        <path d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`} fill="none" stroke="#e2e8f0" strokeWidth="0.3" />
                      </pattern>
                      <pattern id="grid-major" width={GRID_SIZE * 5} height={GRID_SIZE * 5} patternUnits="userSpaceOnUse">
                        <rect width={GRID_SIZE * 5} height={GRID_SIZE * 5} fill="url(#grid-minor)" />
                        <path d={`M ${GRID_SIZE * 5} 0 L 0 0 0 ${GRID_SIZE * 5}`} fill="none" stroke="#cbd5e1" strokeWidth="0.6" />
                      </pattern>
                    </defs>
                    <rect width={CANVAS_W} height={CANVAS_H} fill="url(#grid-major)" opacity={bgImage ? 0.4 : 1} />
                  </>
                )}

                
                {rooms.filter(r => r.type === 'corridor').map(r => {
                  const fs = Math.min(13, Math.max(8, Math.floor(Math.min(r.w, r.h) / 4)));
                  const sel = selectedId === r.id;
                  return (
                    <g key={r.id} opacity={r.locked ? 0.6 : 1}>
                      <rect x={r.x} y={r.y} width={r.w} height={r.h}
                        fill="#fdf6e3" stroke={sel ? '#f59e0b' : '#b8a87a'}
                        strokeWidth={sel ? 2 : 1.5} strokeDasharray="6,3" />
                      <text x={r.x + r.w / 2} y={r.y + r.h / 2 + Math.floor(fs / 3)}
                        textAnchor="middle" fontSize={fs} fontFamily="monospace" fill="#7a6030" fontWeight="600">
                        {r.label}
                      </text>
                      {sel && !r.locked && renderResizeHandles(r)}
                    </g>
                  );
                })}

                
                {rooms.filter(r => r.type === 'room').map(r => {
                  const fs = Math.min(14, Math.max(9, Math.floor(Math.min(r.w, r.h) / 4)));
                  const sel = selectedId === r.id;
                  return (
                    <g key={r.id} opacity={r.locked ? 0.7 : 1}>
                      <rect x={r.x} y={r.y} width={r.w} height={r.h}
                        fill="#e8f4f8" stroke={sel ? '#0ea5e9' : '#334155'}
                        strokeWidth={sel ? 2.5 : 2} />
                      <text x={r.x + r.w / 2} y={r.y + r.h / 2 + Math.floor(fs / 3)}
                        textAnchor="middle" fontSize={fs} fontFamily="monospace" fill="#1a4a6b" fontWeight="700">
                        {r.label}
                      </text>
                      {sel && !r.locked && renderResizeHandles(r)}
                      {r.locked && (
                        <text x={r.x + r.w - 8} y={r.y + 12} fontSize={10} fill="#f59e0b" opacity={0.7}>🔒</text>
                      )}
                    </g>
                  );
                })}

                
                {walls.map(w => (
                  <line key={w.id} x1={w.x1} y1={w.y1} x2={w.x2} y2={w.y2}
                    stroke="#334155" strokeWidth={4} strokeLinecap="round" />
                ))}

                
                {drawing && tool === 'wall' && (
                  <line x1={drawing.x1} y1={drawing.y1} x2={drawing.x2} y2={drawing.y2}
                    stroke="#0ea5e9" strokeWidth={3} strokeDasharray="6,3" strokeLinecap="round" opacity={0.8} />
                )}

                
                {previewRect && previewRect.w > 2 && previewRect.h > 2 && (
                  <g>
                    <rect x={previewRect.x} y={previewRect.y} width={previewRect.w} height={previewRect.h}
                      fill={tool === 'corridor' ? 'rgba(253,246,227,0.5)' : 'rgba(232,244,248,0.5)'}
                      stroke="#0ea5e9" strokeWidth={1.5} strokeDasharray="6,3" />
                    <text x={previewRect.x + previewRect.w / 2} y={previewRect.y + previewRect.h / 2 + 4}
                      textAnchor="middle" fontSize={10} fontFamily="monospace" fill="#0ea5e9" opacity={0.7}>
                      {previewRect.w}×{previewRect.h}
                    </text>
                  </g>
                )}
              </svg>
            </div>
          </div>
        </div>

        
        {showPreview && (
          <div className="w-64 shrink-0 border-l border-slate-800 bg-slate-950 flex flex-col">
            <div className="px-4 py-3 border-b border-slate-800">
              <p className="text-xs font-bold text-slate-500 tracking-widest">SVG ПРЕВ'Ю</p>
            </div>
            <div className="flex-1 overflow-auto p-3">
              <div className="rounded-xl overflow-hidden border border-slate-800"
                dangerouslySetInnerHTML={{ __html: buildSVG(rooms, walls) }} />
              <p className="text-xs text-slate-600 mt-2">Саме так карта виглядатиме для студентів</p>
            </div>
          </div>
        )}
      </div>

      
      <div className="px-5 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center gap-6 shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-3.5 rounded-sm border-2 border-slate-500" style={{ background: '#e8f4f8' }} />
          <span className="text-xs text-slate-500">Кімната</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-3.5 rounded-sm" style={{ background: '#fdf6e3', border: '1.5px dashed #b8a87a' }} />
          <span className="text-xs text-slate-500">Коридор</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-0.5 bg-slate-500 rounded" />
          <span className="text-xs text-slate-500">Стіна</span>
        </div>
        <div className="ml-auto text-xs text-slate-600">
          Ctrl+Z скасувати · Ctrl+Y повторити · Del видалити · Scroll = зум · ↑↓←→ переміщення
        </div>
      </div>
    </div>
  );
};

export default MapEditor;
