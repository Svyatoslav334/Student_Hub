import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../../services/api';
import {
  Search, Navigation, MapPin, Loader2,
  AlertCircle, RotateCcw, Layers, ChevronUp,
  ArrowRight, X, Building2, Route,
} from 'lucide-react';


interface RoomData {
  id: number;
  name: string;
  label?: string;
  type?: 'room' | 'corridor';
  x: number;
  y: number;
  width: number;
  height: number;
  doorX: number;
  doorY: number;
}

interface MapData {
  id: number;
  name: string;
  floor: number;
  svgData?: string;
  imageUrl?: string;
  rooms: RoomData[];
}

const CANVAS_W = 1280;
const CANVAS_H = 1280;
const FLOOR_OPTIONS = [1, 2, 3, 4, 5];


interface GraphNode {
  id: string;
  x: number;
  y: number;
}

interface GraphEdge {
  from: string;
  to: string;
  cost: number;
}


function corridorNodes(c: RoomData): GraphNode[] {
  const nodes: GraphNode[] = [];
  const cx = c.x + c.width / 2;
  const cy = c.y + c.height / 2;
  nodes.push({ id: `corr-${c.id}-center`, x: cx, y: cy });
  nodes.push({ id: `corr-${c.id}-door`, x: c.doorX, y: c.doorY });
  return nodes;
}

export default function MapPage() {
  const [maps, setMaps] = useState<MapData[]>([]);
  const [activeFloor, setActiveFloor] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  
  const [selectedRoom, setSelectedRoom] = useState<RoomData | null>(null);

  
  const [startQuery, setStartQuery] = useState('');
  const [endQuery, setEndQuery] = useState('');
  const [startRoom, setStartRoom] = useState<RoomData | null>(null);
  const [endRoom, setEndRoom] = useState<RoomData | null>(null);
  const [showStartSuggestions, setShowStartSuggestions] = useState(false);
  const [showEndSuggestions, setShowEndSuggestions] = useState(false);

  
  const [path, setPath] = useState<Array<{ x: number; y: number }> | null>(null);

  
  const [drawerOpen, setDrawerOpen] = useState(false);

  
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  
  useEffect(() => {
    async function loadMaps() {
      try {
        setLoading(true);
        const res = await api.get('/map/all');
        setMaps(res.data);
        if (res.data.length > 0) {
          
          const sorted = [...res.data].sort((a, b) => a.floor - b.floor);
          setActiveFloor(sorted[0].floor);
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Не вдалося завантажити карту');
      } finally {
        setLoading(false);
      }
    }
    loadMaps();
  }, []);

  
  const currentMap = maps.find(m => m.floor === activeFloor);

  
  useEffect(() => {
    setPath(null);
    setStartRoom(null);
    setEndRoom(null);
    setStartQuery('');
    setEndQuery('');
    setSelectedRoom(null);
  }, [activeFloor]);

  
  const handleRoomClick = (room: RoomData) => {
    if (room.type === 'corridor') return;
    setSelectedRoom(room);

    
    if (!startRoom) {
      setStartRoom(room);
      setStartQuery(room.name);
    } else if (!endRoom && startRoom.id !== room.id) {
      setEndRoom(room);
      setEndQuery(room.name);
    }
  };

  
  const findPath = useCallback(() => {
    if (!currentMap || !startRoom || !endRoom) return;

    
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    
    nodes.push({ id: `room-${startRoom.id}`, x: startRoom.doorX, y: startRoom.doorY });
    nodes.push({ id: `room-${endRoom.id}`, x: endRoom.doorX, y: endRoom.doorY });

    
    const corridors = currentMap.rooms.filter(r => r.type === 'corridor');
    corridors.forEach(c => {
      const cNodes = corridorNodes(c);
      nodes.push(...cNodes);

      
      edges.push({
        from: cNodes[0].id,
        to: cNodes[1].id,
        cost: Math.hypot(cNodes[0].x - cNodes[1].x, cNodes[0].y - cNodes[1].y),
      });
    });

    
    corridors.forEach(c => {
      
      if (
        Math.abs(startRoom.doorX - c.doorX) < 150 &&
        Math.abs(startRoom.doorY - c.doorY) < 150
      ) {
        edges.push({
          from: `room-${startRoom.id}`,
          to: `corr-${c.id}-door`,
          cost: Math.hypot(startRoom.doorX - c.doorX, startRoom.doorY - c.doorY),
        });
      }
      if (
        Math.abs(endRoom.doorX - c.doorX) < 150 &&
        Math.abs(endRoom.doorY - c.doorY) < 150
      ) {
        edges.push({
          from: `room-${endRoom.id}`,
          to: `corr-${c.id}-door`,
          cost: Math.hypot(endRoom.doorX - c.doorX, endRoom.doorY - c.doorY),
        });
      }
    });

    
    for (let i = 0; i < corridors.length; i++) {
      for (let j = i + 1; j < corridors.length; j++) {
        const c1 = corridors[i];
        const c2 = corridors[j];
        
        const dist = Math.hypot(
          (c1.x + c1.width / 2) - (c2.x + c2.width / 2),
          (c1.y + c1.height / 2) - (c2.y + c2.height / 2)
        );
        if (dist < 400) {
          edges.push({
            from: `corr-${c1.id}-center`,
            to: `corr-${c2.id}-center`,
            cost: dist,
          });
        }
      }
    }

    
    const graph: Record<string, Record<string, number>> = {};
    nodes.forEach(n => { graph[n.id] = {}; });
    edges.forEach(e => {
      if (graph[e.from] && graph[e.to]) {
        graph[e.from][e.to] = e.cost;
        graph[e.to][e.from] = e.cost; 
      }
    });

    
    const startId = `room-${startRoom.id}`;
    const endId = `room-${endRoom.id}`;

    const distances: Record<string, number> = {};
    const prev: Record<string, string | null> = {};
    const queue = new Set<string>();

    nodes.forEach(n => {
      distances[n.id] = Infinity;
      prev[n.id] = null;
      queue.add(n.id);
    });
    distances[startId] = 0;

    while (queue.size > 0) {
      let u: string | null = null;
      queue.forEach(nodeId => {
        if (u === null || distances[nodeId] < distances[u]) {
          u = nodeId;
        }
      });

      if (!u || distances[u] === Infinity || u === endId) break;
      queue.delete(u);

      const neighbors = graph[u] || {};
      for (const v in neighbors) {
        if (!queue.has(v)) continue;
        const alt = distances[u] + neighbors[v];
        if (alt < distances[v]) {
          distances[v] = alt;
          prev[v] = u;
        }
      }
    }

    
    if (distances[endId] === Infinity) {
      setPath([
        { x: startRoom.doorX, y: startRoom.doorY },
        { x: endRoom.doorX, y: endRoom.doorY },
      ]);
      return;
    }

    const resPath: Array<{ x: number; y: number }> = [];
    let curr: string | null = endId;
    while (curr !== null) {
      const n = nodes.find(node => node.id === curr);
      if (n) resPath.unshift({ x: n.x, y: n.y });
      curr = prev[curr];
    }

    setPath(resPath);
  }, [currentMap, startRoom, endRoom]);

  
  useEffect(() => {
    if (startRoom && endRoom) {
      findPath();
    } else {
      setPath(null);
    }
  }, [startRoom, endRoom, findPath]);

  
  const handleMouseDown = (e: React.MouseEvent) => {
    
    if ((e.target as HTMLElement).closest('[data-no-pan]')) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    setOffset({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    let nextScale = scale;
    if (e.deltaY < 0) {
      nextScale = Math.min(scale * zoomFactor, 5);
    } else {
      nextScale = Math.max(scale / zoomFactor, 0.5);
    }
    setScale(nextScale);
  };

  const resetView = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  
  if (loading) {
    return (
      <div className="w-full h-screen bg-slate-950 flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-cyan-400" size={32} />
        <p className="text-sm text-slate-400 font-medium">Завантаження інтерактивної карти...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="text-red-400 mb-3" size={40} />
        <h3 className="text-lg font-bold text-slate-200 mb-1">Помилка завантаження</h3>
        <p className="text-sm text-slate-500 max-w-sm mb-4">{error}</p>
      </div>
    );
  }

  
  const roomsList = currentMap?.rooms || [];
  const filteredStart = startQuery
    ? roomsList.filter(r => r.type !== 'corridor' && r.name.toLowerCase().includes(startQuery.toLowerCase()))
    : [];
  const filteredEnd = endQuery
    ? roomsList.filter(r => r.type !== 'corridor' && r.name.toLowerCase().includes(endQuery.toLowerCase()))
    : [];

  
  const mapCanvas = (
    <div
      className="w-full h-full cursor-grab active:cursor-grabbing select-none relative overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      onWheel={handleWheel}
    >
      {currentMap ? (
        <svg
          ref={svgRef}
          viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
          className="w-full h-full origin-center transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          }}
        >
          {/* ФОН КАРТИ */}
          <rect width={CANVAS_W} height={CANVAS_H} fill="#090d16" />

          {/* СІТКА КОРПУСУ */}
          <g opacity="0.03">
            {Array.from({ length: 26 }).map((_, i) => (
              <line key={`h-${i}`} x1={0} y1={i * 50} x2={CANVAS_W} y2={i * 50} stroke="white" strokeWidth={1} />
            ))}
            {Array.from({ length: 26 }).map((_, i) => (
              <line key={`v-${i}`} x1={i * 50} y1={0} x2={i * 50} y2={CANVAS_H} stroke="white" strokeWidth={1} />
            ))}
          </g>

          {/* ВІДОБРАЖЕННЯ ПРИМІЩЕНЬ */}
          {roomsList.map(room => {
            const isCorridor = room.type === 'corridor';
            const isSelected = selectedRoom?.id === room.id;
            const isStart = startRoom?.id === room.id;
            const isEnd = endRoom?.id === room.id;

            let fill = '#131c2e'; 
            let stroke = '#1e293b';
            let strokeW = 1.5;

            if (isCorridor) {
              fill = '#0f172a'; 
              stroke = '#1e293b';
            } else if (isStart) {
              fill = '#064e3b';
              stroke = '#10b981';
              strokeW = 2;
            } else if (isEnd) {
              fill = '#5c1d1d';
              stroke = '#ef4444';
              strokeW = 2;
            } else if (isSelected) {
              fill = '#1e293b';
              stroke = '#06b6d4';
              strokeW = 2;
            }

            return (
              <g
                key={room.id}
                className={isCorridor ? '' : 'cursor-pointer hover:opacity-80 transition-opacity'}
                onClick={() => handleRoomClick(room)}
              >
                <rect
                  x={room.x}
                  y={room.y}
                  width={room.width}
                  height={room.height}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeW}
                  rx={isCorridor ? 0 : 6}
                />
                {!isCorridor && (
                  <text
                    x={room.x + room.width / 2}
                    y={room.y + room.height / 2 + 4}
                    textAnchor="middle"
                    fill={isStart || isEnd ? '#fff' : '#94a3b8'}
                    fontSize={12}
                    fontWeight="bold"
                    className="pointer-events-none select-none"
                  >
                    {room.name}
                  </text>
                )}
              </g>
            );
          })}

          {/* МАЛЮВАННЯ МАРШРУТУ */}
          {path && path.length > 1 && (
            <g className="pointer-events-none">
              <path
                d={`M ${path.map(p => `${p.x},${p.y}`).join(' L ')}`}
                fill="none"
                stroke="#22d3ee"
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="8 6"
                className="animate-[dash_20s_linear_infinite]"
              />
              {startRoom && <circle cx={startRoom.doorX} cy={startRoom.doorY} r={6} fill="#10b981" />}
              {endRoom && <circle cx={endRoom.doorX} cy={endRoom.doorY} r={6} fill="#ef4444" />}
            </g>
          )}
        </svg>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
          План для цього поверху відсутній
        </div>
      )}
    </div>
  );


  const searchPanelProps = {
    startQuery, setStartQuery, startRoom, setStartRoom, showStartSuggestions, setShowStartSuggestions, filteredStart,
    endQuery, setEndQuery, endRoom, setEndRoom, showEndSuggestions, setShowEndSuggestions, filteredEnd,
    path, setPath, setSelectedRoom,
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 flex flex-col md:flex-row overflow-hidden">
      
      {/* 1. БІЧНА ПАНЕЛЬ (Показується ТІЛЬКИ на комп'ютерах, на мобілках схована) */}
      <aside className="hidden md:flex flex-col w-80 lg:w-96 bg-slate-900 border-r border-slate-800 p-5 z-20 shrink-0 overflow-y-auto">
        <div className="flex items-center gap-2.5 mb-5">
          <Building2 className="text-cyan-400" size={20} />
          <h1 className="text-base font-bold text-slate-100">Навігація корпусом</h1>
        </div>

        {/* Вибір поверху для комп'ютерів */}
        <div className="mb-5">
          <label className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
            <Layers size={13} /> Поверх
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {FLOOR_OPTIONS.map(f => {
              const has = maps.some(m => m.floor === f);
              return (
                <button
                  key={f}
                  disabled={!has}
                  onClick={() => has && setActiveFloor(f)}
                  className={`py-2 rounded-xl text-xs font-bold transition ${
                    activeFloor === f
                      ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                      : has ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'text-slate-700 cursor-not-allowed opacity-40'
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>

        <hr className="border-slate-800 mb-5" />

        {/* Форма пошуку маршруту */}
        <SearchPanel {...searchPanelProps} />
      </aside>

      {/* 2. ЗОНА КАРТИ (Займає весь залишок екрана і на ПК, і на мобілках) */}
      <div className="flex-1 relative overflow-hidden flex flex-col h-full">
        
        {/* Кнопки керування у правому кутку */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2" data-no-pan>
          <button
            onClick={resetView}
            className="p-2.5 bg-slate-900/90 border border-slate-700/50 rounded-xl text-slate-300 hover:text-white backdrop-blur-sm shadow-lg transition"
            title="Скинути масштаб"
          >
            <RotateCcw size={15} />
          </button>

          {/* Компактний вибір поверху (Показується ТІЛЬКИ на мобілках у стовпчик) */}
          <div className="flex flex-col gap-1 bg-slate-900/90 border border-slate-700/50 rounded-xl p-1 backdrop-blur-sm shadow-lg md:hidden">
            {FLOOR_OPTIONS.map(f => {
              const has = maps.some(m => m.floor === f);
              return (
                <button
                  key={f}
                  disabled={!has}
                  onClick={() => has && setActiveFloor(f)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center ${
                    activeFloor === f ? 'bg-cyan-500 text-black' : has ? 'text-slate-400' : 'text-slate-700 cursor-not-allowed opacity-30'
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>

        {/* Саме полотно з SVG картою */}
        {mapCanvas}

        {/* 3. НИЖНЯ ШТОРКА (Показується ТІЛЬКИ на мобілках, на комп'ютерах повністю схована) */}
        <div
          className="absolute left-0 right-0 bottom-0 z-30 transition-transform duration-300 ease-in-out md:hidden"
          style={{ transform: drawerOpen ? 'translateY(0)' : 'translateY(calc(100% - 56px))' }}
          data-no-pan
        >
          {/* Ярлик шторки для кліку */}
          <div
            className="flex items-center justify-between px-5 py-3.5 bg-slate-900 border-t border-slate-800 cursor-pointer rounded-t-3xl shadow-2xl"
            onClick={() => setDrawerOpen(v => !v)}
          >
            <div className="flex items-center gap-2">
              <Navigation size={15} className="text-cyan-400" />
              <span className="text-sm font-bold text-slate-200">
                {path ? 'Маршрут побудовано' : 'Знайти аудиторію'}
              </span>
            </div>
            <ChevronUp
              size={17}
              className={`text-slate-500 transition-transform duration-300 ${drawerOpen ? '' : 'rotate-180'}`}
            />
          </div>

          {/* Вміст шторки, що виїжджає */}
          <div className="bg-slate-900 px-5 pb-8 pt-2 border-t border-slate-800 max-h-[60vh] overflow-y-auto">
            <SearchPanel {...searchPanelProps} />
          </div>
        </div>
      </div>

    </div>
  );
}


function SearchPanel({
  startQuery, setStartQuery, startRoom, setStartRoom, showStartSuggestions, setShowStartSuggestions, filteredStart,
  endQuery, setEndQuery, endRoom, setEndRoom, showEndSuggestions, setShowEndSuggestions, filteredEnd,
  path, setPath, setSelectedRoom
}: any) {
  return (
    <div className="flex flex-col gap-4">
      {/* КІМНАТА СТАРТУ */}
      <div className="relative">
        <label className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
          <MapPin size={13} className="text-emerald-500" /> Звідки (Початкова точка)
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Пошук кімнати..."
            value={startQuery}
            onChange={(e) => {
              setStartQuery(e.target.value);
              setShowStartSuggestions(true);
              if (!e.target.value) setStartRoom(null);
            }}
            onFocus={() => setShowStartSuggestions(true)}
            className="w-full pl-9 pr-8 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition"
          />
          <Search className="absolute left-3 top-3 text-slate-600" size={14} />
          {startQuery && (
            <button
              onClick={() => { setStartQuery(''); setStartRoom(null); }}
              className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {showStartSuggestions && filteredStart.length > 0 && (
          <div className="absolute left-0 right-0 mt-1 bg-slate-950 border border-slate-800 rounded-xl shadow-xl z-50 max-h-40 overflow-y-auto">
            {filteredStart.map((r: any) => (
              <div
                key={r.id}
                onClick={() => {
                  setStartRoom(r);
                  setStartQuery(r.name);
                  setShowStartSuggestions(false);
                }}
                className="px-4 py-2 text-xs text-slate-400 hover:bg-slate-900 hover:text-white cursor-pointer transition"
              >
                {r.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* КІМНАТА ФІНІШУ */}
      <div className="relative">
        <label className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
          <MapPin size={13} className="text-red-500" /> Куди (Кінцева точка)
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Пошук кімнати..."
            value={endQuery}
            onChange={(e) => {
              setEndQuery(e.target.value);
              setShowEndSuggestions(true);
              if (!e.target.value) setEndRoom(null);
            }}
            onFocus={() => setShowEndSuggestions(true)}
            className="w-full pl-9 pr-8 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition"
          />
          <Search className="absolute left-3 top-3 text-slate-600" size={14} />
          {endQuery && (
            <button
              onClick={() => { setEndQuery(''); setEndRoom(null); }}
              className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {showEndSuggestions && filteredEnd.length > 0 && (
          <div className="absolute left-0 right-0 mt-1 bg-slate-950 border border-slate-800 rounded-xl shadow-xl z-50 max-h-40 overflow-y-auto">
            {filteredEnd.map((r: any) => (
              <div
                key={r.id}
                onClick={() => {
                  setEndRoom(r);
                  setEndQuery(r.name);
                  setShowEndSuggestions(false);
                }}
                className="px-4 py-2 text-xs text-slate-400 hover:bg-slate-900 hover:text-white cursor-pointer transition"
              >
                {r.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ІНФОРМАЦІЯ ПРО МАРШРУТ */}
      {path && (
        <div className="mt-2 p-3 bg-cyan-950/20 border border-cyan-900/40 rounded-xl">
          <div className="flex items-center gap-2 text-cyan-400 mb-1">
            <Route size={14} />
            <span className="text-xs font-bold">Маршрут прокладено</span>
          </div>
          <p className="text-[11px] text-slate-400 flex items-center gap-1 flex-wrap">
            <span>{startRoom?.name}</span>
            <ArrowRight size={10} className="text-slate-600" />
            <span>{endRoom?.name}</span>
          </p>
          <button
            onClick={() => {
              setPath(null);
              setStartRoom(null);
              setEndRoom(null);
              setStartQuery('');
              setEndQuery('');
              setSelectedRoom(null);
            }}
            className="mt-2.5 w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-medium transition"
          >
            Очистити маршрут
          </button>
        </div>
      )}
    </div>
  );
}
