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
  const isHorizontal = c.width >= c.height;

  if (isHorizontal) {
    const step = 80;
    for (let x = c.x; x <= c.x + c.width; x += step) {
      nodes.push({ id: `c${c.id}_x${Math.round(x)}`, x: Math.round(x), y: Math.round(cy) });
    }
    nodes.push({ id: `c${c.id}_left`, x: c.x, y: Math.round(cy) });
    nodes.push({ id: `c${c.id}_right`, x: c.x + c.width, y: Math.round(cy) });
  } else {
    const step = 80;
    for (let y = c.y; y <= c.y + c.height; y += step) {
      nodes.push({ id: `c${c.id}_y${Math.round(y)}`, x: Math.round(cx), y: Math.round(y) });
    }
    nodes.push({ id: `c${c.id}_top`, x: Math.round(cx), y: c.y });
    nodes.push({ id: `c${c.id}_bot`, x: Math.round(cx), y: c.y + c.height });
  }

  const seen = new Set<string>();
  return nodes.filter(n => {
    const key = `${n.x},${n.y}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}


function inRect(r: RoomData, px: number, py: number, pad = 0): boolean {
  return px >= r.x - pad && px <= r.x + r.width + pad &&
         py >= r.y - pad && py <= r.y + r.height + pad;
}


function buildGraph(rooms: RoomData[]): { nodes: Map<string, GraphNode>; edges: GraphEdge[] } {
  const corridors = rooms.filter(r => r.type === 'corridor');
  const roomList  = rooms.filter(r => r.type === 'room');

  const nodes = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];
  const corridorNodeMap = new Map<number, GraphNode[]>();

  for (const c of corridors) {
    const cNodes = corridorNodes(c);
    corridorNodeMap.set(c.id, cNodes);
    for (const n of cNodes) nodes.set(n.id, n);

    const sorted = cNodes.slice().sort((a, b) =>
      c.width >= c.height ? a.x - b.x : a.y - b.y
    );
    for (let i = 0; i < sorted.length - 1; i++) {
      const a = sorted[i], b = sorted[i + 1];
      const cost = Math.hypot(b.x - a.x, b.y - a.y);
      edges.push({ from: a.id, to: b.id, cost });
      edges.push({ from: b.id, to: a.id, cost });
    }
  }

  for (let i = 0; i < corridors.length; i++) {
    for (let j = i + 1; j < corridors.length; j++) {
      const a = corridors[i], b = corridors[j];
      const pad = 15;
      const overlap =
        a.x - pad < b.x + b.width  && a.x + a.width  > b.x - pad &&
        a.y - pad < b.y + b.height && a.y + a.height > b.y - pad;
      if (!overlap) continue;

      const aNear = corridorNodeMap.get(a.id)?.filter(n => inRect(b, n.x, n.y, pad)) ?? [];
      const bNear = corridorNodeMap.get(b.id)?.filter(n => inRect(a, n.x, n.y, pad)) ?? [];
      const allA = aNear.length ? aNear : (corridorNodeMap.get(a.id) ?? []);
      const allB = bNear.length ? bNear : (corridorNodeMap.get(b.id) ?? []);

      let bestDist = Infinity;
      let bestPair: [GraphNode, GraphNode] | null = null;
      for (const na of allA) {
        for (const nb of allB) {
          const d = Math.hypot(na.x - nb.x, na.y - nb.y);
          if (d < bestDist) { bestDist = d; bestPair = [na, nb]; }
        }
      }
      if (bestPair && bestDist < 400) {
        const [na, nb] = bestPair;
        edges.push({ from: na.id, to: nb.id, cost: bestDist });
        edges.push({ from: nb.id, to: na.id, cost: bestDist });
      }
    }
  }

  for (const room of roomList) {
    const rcx = room.x + room.width / 2;
    const rcy = room.y + room.height / 2;
    const roomNodeId = `room_${room.id}`;
    nodes.set(roomNodeId, { id: roomNodeId, x: rcx, y: rcy });

    const TOUCH_PAD = 30;
    const touching = corridors.filter(c => {
      const hOverlap = room.x < c.x + c.width + TOUCH_PAD && room.x + room.width > c.x - TOUCH_PAD;
      const vOverlap = room.y < c.y + c.height + TOUCH_PAD && room.y + room.height > c.y - TOUCH_PAD;
      if (!hOverlap || !vOverlap) return false;

      const leftContact  = Math.abs((room.x + room.width) - c.x) < TOUCH_PAD;
      const rightContact = Math.abs(room.x - (c.x + c.width)) < TOUCH_PAD;
      const topContact    = Math.abs((room.y + room.height) - c.y) < TOUCH_PAD;
      const bottomContact = Math.abs(room.y - (c.y + c.height)) < TOUCH_PAD;

      return leftContact || rightContact || topContact || bottomContact;
    });

    const candidates = touching.length > 0
      ? touching
      : corridors
          .map(c => ({ c, dist: Math.hypot(rcx - (c.x + c.width/2), rcy - (c.y + c.height/2)) }))
          .sort((a, b) => a.dist - b.dist)
          .slice(0, 2)
          .map(x => x.c);

    for (const c of candidates) {
      const cNodes = corridorNodeMap.get(c.id) ?? [];
      let bestNode: GraphNode | null = null;
      let bestDist = Infinity;

      const isH = c.width >= c.height;
      const entryX = isH
        ? Math.max(c.x, Math.min(c.x + c.width, rcx))
        : c.x + c.width / 2;
      const entryY = isH
        ? c.y + c.height / 2
        : Math.max(c.y, Math.min(c.y + c.height, rcy));

      for (const n of cNodes) {
        const d = Math.hypot(n.x - entryX, n.y - entryY);
        if (d < bestDist) { bestDist = d; bestNode = n; }
      }

      if (bestNode) {
        const entryId = `entry_${room.id}_${c.id}`;
        nodes.set(entryId, { id: entryId, x: entryX, y: entryY });

        const distRoomToEntry = Math.hypot(rcx - entryX, rcy - entryY);
        const distEntryToNode = Math.hypot(entryX - bestNode.x, entryY - bestNode.y);

        edges.push({ from: roomNodeId, to: entryId, cost: distRoomToEntry });
        edges.push({ from: entryId, to: roomNodeId, cost: distRoomToEntry });
        edges.push({ from: entryId, to: bestNode.id, cost: distEntryToNode });
        edges.push({ from: bestNode.id, to: entryId, cost: distEntryToNode });
      }
    }
  }

  return { nodes, edges };
}


function graphAstar(
  nodes: Map<string, GraphNode>,
  edges: GraphEdge[],
  startId: string,
  endId: string
): { x: number; y: number }[] | null {
  if (!nodes.has(startId) || !nodes.has(endId)) return null;

  const adj = new Map<string, { to: string; cost: number }[]>();
  for (const e of edges) {
    if (!adj.has(e.from)) adj.set(e.from, []);
    adj.get(e.from)!.push({ to: e.to, cost: e.cost });
  }

  const endNode = nodes.get(endId)!;
  const h = (id: string) => {
    const n = nodes.get(id)!;
    return Math.hypot(n.x - endNode.x, n.y - endNode.y);
  };

  const gScore = new Map<string, number>();
  const prev = new Map<string, string>();
  const open = new Set<string>();
  const closed = new Set<string>();

  gScore.set(startId, 0);
  open.add(startId);

  while (open.size > 0) {
    let cur = '';
    let minF = Infinity;
    for (const id of open) {
      const f = (gScore.get(id) ?? Infinity) + h(id);
      if (f < minF) { minF = f; cur = id; }
    }
    if (!cur) break;
    if (cur === endId) {
      const path: { x: number; y: number }[] = [];
      let c: string | undefined = endId;
      while (c) {
        const n = nodes.get(c)!;
        path.unshift({ x: n.x, y: n.y });
        c = prev.get(c);
      }
      return path;
    }

    open.delete(cur);
    closed.add(cur);

    for (const { to, cost } of (adj.get(cur) ?? [])) {
      if (closed.has(to)) continue;
      const ng = (gScore.get(cur) ?? Infinity) + cost;
      if (ng < (gScore.get(to) ?? Infinity)) {
        gScore.set(to, ng);
        prev.set(to, cur);
        open.add(to);
      }
    }
  }

  return null;
}

function rdp(pts: { x: number; y: number }[], eps: number): { x: number; y: number }[] {
  if (pts.length < 3) return pts;
  let maxD = 0, maxI = 0;
  const [p1, p2] = [pts[0], pts[pts.length - 1]];
  const len = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);

  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i];
    const d = len === 0
      ? Math.sqrt((p.x - p1.x) ** 2 + (p.y - p1.y) ** 2)
      : Math.abs((p2.y - p1.y) * p.x - (p2.x - p1.x) * p.y + p2.x * p1.y - p2.y * p1.x) / len;
    if (d > maxD) { maxD = d; maxI = i; }
  }

  if (maxD > eps) {
    return [...rdp(pts.slice(0, maxI + 1), eps), ...rdp(pts.slice(maxI), eps).slice(1)];
  }
  return [pts[0], pts[pts.length - 1]];
}

function findPath(start: RoomData, end: RoomData, allRooms: RoomData[]): { x: number; y: number }[] | null {
  const { nodes, edges } = buildGraph(allRooms);
  const startId = `room_${start.id}`;
  const endId   = `room_${end.id}`;
  const raw = graphAstar(nodes, edges, startId, endId);
  if (!raw || raw.length < 2) return null;
  return rdp(raw, 12);
}

function buildPathD(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return '';
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
}

interface SearchPanelProps {
  map: MapData | null;
  startQuery: string;
  endQuery: string;
  startRoom: RoomData | null;
  endRoom: RoomData | null;
  startSugs: RoomData[];
  endSugs: RoomData[];
  showStartSug: boolean;
  showEndSug: boolean;
  pathError: string;
  path: { x: number; y: number }[] | null;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
  onStartFocus: () => void;
  onEndFocus: () => void;
  onStartBlur: () => void;
  onEndBlur: () => void;
  pickStart: (r: RoomData) => void;
  pickEnd: (r: RoomData) => void;
  handleSearch: () => void;
  handleSwap: () => void;
  clearStart: () => void;
  clearEnd: () => void;
}

const SearchPanel = ({
  map, startQuery, endQuery, startRoom, endRoom,
  startSugs, endSugs, showStartSug, showEndSug,
  pathError,
  onStartChange, onEndChange,
  onStartFocus, onEndFocus,
  onStartBlur, onEndBlur,
  pickStart, pickEnd,
  handleSearch, handleSwap,
  clearStart, clearEnd,
}: SearchPanelProps) => (
  <div className="flex flex-col gap-3 w-full">

    <div className="relative">
      <label className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
        <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
        Де ви зараз?
      </label>
      <div className="relative flex items-center">
        <input
          value={startQuery}
          onChange={e => onStartChange(e.target.value)}
          onFocus={onStartFocus}
          onBlur={onStartBlur}
          placeholder="Наприклад: 312"
          className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition pr-9"
        />
        {startQuery && (
          <button
            className="absolute right-3 text-slate-500 hover:text-slate-300"
            onClick={clearStart}
          >
            <X size={14} />
          </button>
        )}
      </div>
      {showStartSug && startSugs.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden z-50 shadow-2xl">
          {startSugs.map(r => (
            <button
              key={r.id}
              onMouseDown={() => pickStart(r)}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm text-slate-200 hover:bg-slate-700 transition border-b border-slate-700/50 last:border-0"
            >
              <MapPin size={12} className="text-green-400 shrink-0" />
              {r.name}
            </button>
          ))}
        </div>
      )}
    </div>

    <div className="flex justify-center">
      <button
        onClick={handleSwap}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 px-3 py-1.5 rounded-xl hover:bg-slate-800 transition"
      >
        <ArrowRight size={11} className="rotate-90" />
        Поміняти місцями
      </button>
    </div>
    <div className="relative">
      <label className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
        <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
        Куди вам треба?
      </label>
      <div className="relative flex items-center">
        <input
          value={endQuery}
          onChange={e => onEndChange(e.target.value)}
          onFocus={onEndFocus}
          onBlur={onEndBlur}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Наприклад: 405"
          className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition pr-9"
        />
        {endQuery && (
          <button
            className="absolute right-3 text-slate-500 hover:text-slate-300"
            onClick={clearEnd}
          >
            <X size={14} />
          </button>
        )}
      </div>
      {showEndSug && endSugs.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden z-50 shadow-2xl">
          {endSugs.map(r => (
            <button
              key={r.id}
              onMouseDown={() => pickEnd(r)}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm text-slate-200 hover:bg-slate-700 transition border-b border-slate-700/50 last:border-0"
            >
              <MapPin size={12} className="text-red-400 shrink-0" />
              {r.name}
            </button>
          ))}
        </div>
      )}
    </div>

    {pathError && (
      <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3">
        <AlertCircle size={13} className="text-red-400 mt-0.5 shrink-0" />
        <p className="text-xs text-red-300">{pathError}</p>
      </div>
    )}
    <button
      onClick={handleSearch}
      disabled={!startQuery.trim() || !endQuery.trim()}
      className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-black font-bold rounded-2xl text-sm transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      <Search size={15} />
      Показати маршрут
    </button>

    {map && map.rooms.filter(r => r.type !== 'corridor').length > 0 && (
      <div>
        <p className="text-xs text-slate-600 mb-2">Всі аудиторії на поверсі:</p>
        <div className="flex flex-wrap gap-1.5">
          {map.rooms
            .filter(r => r.type !== 'corridor')
            .map(r => (
              <button
                key={r.id}
                onClick={() => pickEnd(r)}
                className={`px-2.5 py-1 rounded-xl text-xs font-medium transition border ${
                  endRoom?.id === r.id
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : startRoom?.id === r.id
                      ? 'bg-green-500/15 text-green-300 border-green-500/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
                }`}
              >
                {r.name}
              </button>
            ))}
        </div>
      </div>
    )}
  </div>
);


const MapPage = () => {
  const [maps, setMaps] = useState<MapData[]>([]);
  const [activeFloor, setActiveFloor] = useState(1);
  const [map, setMap] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [startQuery, setStartQuery] = useState('');
  const [endQuery, setEndQuery] = useState('');
  const [startRoom, setStartRoom] = useState<RoomData | null>(null);
  const [endRoom, setEndRoom] = useState<RoomData | null>(null);
  const [startSugs, setStartSugs] = useState<RoomData[]>([]);
  const [endSugs, setEndSugs] = useState<RoomData[]>([]);
  const [showStartSug, setShowStartSug] = useState(false);
  const [showEndSug, setShowEndSug] = useState(false);

  const [path, setPath] = useState<{ x: number; y: number }[] | null>(null);
  const [pathError, setPathError] = useState('');
  const [animOffset, setAnimOffset] = useState(0);

  const [drawerOpen, setDrawerOpen] = useState(true);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const lastTouchDistRef = useRef<number | null>(null);

  const svgContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!path) return;
    let raf: number;
    const tick = () => { setAnimOffset(o => (o + 1) % 28); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [path]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get('/map/all');
        const data: MapData[] = res.data;
        setMaps(data);
        const first = data[0];
        if (first) { setMap(first); setActiveFloor(first.floor); }
      } catch {
        setError('Не вдалося завантажити карту');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const found = maps.find(m => m.floor === activeFloor) ?? null;
    setMap(found);
    resetSearch();
  }, [activeFloor, maps]);

  const resetSearch = () => {
    setStartQuery(''); setEndQuery('');
    setStartRoom(null); setEndRoom(null);
    setPath(null); setPathError('');
    setStartSugs([]); setEndSugs([]);
  };

  const searchRooms = useCallback((q: string): RoomData[] => {
    if (!map?.rooms || !q.trim()) return [];
    const lq = q.toLowerCase().trim();
    return map.rooms
      .filter(r => r.type !== 'corridor')
      .filter(r => r.name.toLowerCase().includes(lq) || (r.label ?? '').toLowerCase().includes(lq))
      .slice(0, 8);
  }, [map]);

  const onStartChange = (v: string) => {
    setStartQuery(v); setStartRoom(null); setPath(null); setPathError('');
    const s = searchRooms(v); setStartSugs(s); setShowStartSug(s.length > 0);
  };
  const onEndChange = (v: string) => {
    setEndQuery(v); setEndRoom(null); setPath(null); setPathError('');
    const s = searchRooms(v); setEndSugs(s); setShowEndSug(s.length > 0);
  };

  const pickStart = (r: RoomData) => { setStartRoom(r); setStartQuery(r.name); setShowStartSug(false); };
  const pickEnd   = (r: RoomData) => { setEndRoom(r);   setEndQuery(r.name);   setShowEndSug(false); };

  const handleSwap = () => {
    const tmp = startRoom; const tmpQ = startQuery;
    setStartRoom(endRoom); setStartQuery(endQuery);
    setEndRoom(tmp); setEndQuery(tmpQ);
    setPath(null);
  };

  const handleSearch = useCallback(() => {
    setPathError('');
    if (!map) return;

    const s = startRoom ?? map.rooms.find(r => r.type !== 'corridor' && r.name.toLowerCase() === startQuery.toLowerCase().trim());
    const e = endRoom   ?? map.rooms.find(r => r.type !== 'corridor' && r.name.toLowerCase() === endQuery.toLowerCase().trim());

    if (!s) { setPathError(`Кімнату "${startQuery}" не знайдено`); return; }
    if (!e) { setPathError(`Кімнату "${endQuery}" не знайдено`); return; }
    if (s.id === e.id) { setPathError('Початок і кінець — одна кімната'); return; }

    setStartRoom(s); setEndRoom(e);

    const result = findPath(s, e, map.rooms);
    if (!result) {
      setPathError('Маршрут не знайдено — переконайся що кімнати з\'єднані коридорами');
    } else {
      setPath(result);
      setDrawerOpen(false);

      const allX = result.map(p => p.x), allY = result.map(p => p.y);
      const minX = Math.min(...allX), maxX = Math.max(...allX);
      const minY = Math.min(...allY), maxY = Math.max(...allY);
      const midX = (minX + maxX) / 2, midY = (minY + maxY) / 2;

      const container = svgContainerRef.current;
      if (container) {
        const { width, height } = container.getBoundingClientRect();
        const scaleX = width / (maxX - minX + 200);
        const scaleY = height / (maxY - minY + 200);
        const newZoom = Math.min(Math.max(scaleX, scaleY, 0.8), 2.5);
        setZoom(newZoom);
        setPan({
          x: width / 2 - midX * (width / CANVAS_W) * newZoom,
          y: height / 2 - midY * (height / CANVAS_H) * newZoom,
        });
      }
    }
  }, [map, startRoom, endRoom, startQuery, endQuery]);

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('[data-no-pan]')) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    isPanningRef.current = true;
    panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!isPanningRef.current) return;
    setPan({ x: e.clientX - panStartRef.current.x, y: e.clientY - panStartRef.current.y });
  };
  const onPointerUp = () => { isPanningRef.current = false; };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const [t1, t2] = [e.touches[0], e.touches[1]];
      lastTouchDistRef.current = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
    }
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastTouchDistRef.current !== null) {
      e.preventDefault();
      const [t1, t2] = [e.touches[0], e.touches[1]];
      const newDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const delta = newDist / lastTouchDistRef.current;
      setZoom(z => Math.max(0.4, Math.min(4, z * delta)));
      lastTouchDistRef.current = newDist;
    }
  };
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.max(0.4, Math.min(4, z * (e.deltaY < 0 ? 1.1 : 0.9))));
  };
  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const pathD = path ? buildPathD(path) : '';

  const startCenter = startRoom ? {
    x: startRoom.x + startRoom.width / 2,
    y: startRoom.y + startRoom.height / 2,
  } : null;
  const endCenter = endRoom ? {
    x: endRoom.x + endRoom.width / 2,
    y: endRoom.y + endRoom.height / 2,
  } : null;

  const steps = path ? Math.round(path.reduce((acc, p, i) => {
    if (i === 0) return 0;
    return acc + Math.hypot(p.x - path[i - 1].x, p.y - path[i - 1].y);
  }, 0) / 14) : 0;

  const searchPanelProps: SearchPanelProps = {
    map, startQuery, endQuery, startRoom, endRoom,
    startSugs, endSugs, showStartSug, showEndSug,
    pathError, path,
    onStartChange, onEndChange,
    onStartFocus:  () => setShowStartSug(startSugs.length > 0),
    onEndFocus:    () => setShowEndSug(endSugs.length > 0),
    onStartBlur:   () => setTimeout(() => setShowStartSug(false), 200),
    onEndBlur:     () => setTimeout(() => setShowEndSug(false), 200),
    pickStart, pickEnd,
    handleSearch, handleSwap,
    clearStart: () => { setStartQuery(''); setStartRoom(null); setPath(null); },
    clearEnd:   () => { setEndQuery('');   setEndRoom(null);   setPath(null); },
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-slate-950">
      <div className="text-center">
        <Loader2 size={36} className="text-cyan-400 animate-spin mx-auto mb-3" />
        <p className="text-slate-400 text-sm">Завантаження...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-screen bg-slate-950 px-6">
      <div className="text-center">
        <AlertCircle size={36} className="text-red-400 mx-auto mb-3" />
        <p className="text-slate-300 mb-3 text-sm">{error}</p>
        <button onClick={() => window.location.reload()} className="text-cyan-400 text-sm underline">
          Оновити
        </button>
      </div>
    </div>
  );

  const mapCanvas = (
    <div
      ref={svgContainerRef}
      className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing touch-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onWheel={onWheel}
      style={{ background: 'radial-gradient(ellipse at 50% 50%, #0f172a 0%, #020617 100%)' }}
    >
      {map ? (
        <div
          style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})`,
            transformOrigin: 'center center',
            willChange: 'transform',
          }}
        >
          <div style={{
            position: 'relative', width: CANVAS_W, height: CANVAS_H,
            boxShadow: '0 0 0 1px rgba(148,163,184,0.2), 0 30px 80px rgba(0,0,0,0.7)',
          }}>
            {map.svgData ? (
              <div
                dangerouslySetInnerHTML={{ __html: map.svgData }}
                style={{ width: CANVAS_W, height: CANVAS_H }}
              />
            ) : map.imageUrl ? (
              <img src={map.imageUrl} alt={map.name} style={{ width: CANVAS_W, height: CANVAS_H }} />
            ) : (
              <div style={{ width: CANVAS_W, height: CANVAS_H, background: '#f8fafc' }} />
            )}

            <svg
              viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
              width={CANVAS_W} height={CANVAS_H}
              style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', overflow: 'visible' }}
            >
              <defs>
                <filter id="glow-g" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id="glow-r" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id="glow-y" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#fbbf24" />
                </marker>
              </defs>

              {pathD && (
                <>
                  <path d={pathD} fill="none" stroke="rgba(251,191,36,0.15)" strokeWidth={20}
                    strokeLinecap="round" strokeLinejoin="round" />
                  <path d={pathD} fill="none" stroke="rgba(251,191,36,0.4)" strokeWidth={10}
                    strokeLinecap="round" strokeLinejoin="round" />
                  <path d={pathD} fill="none" stroke="#fbbf24" strokeWidth={4}
                    strokeLinecap="round" strokeLinejoin="round"
                    strokeDasharray="14 10" strokeDashoffset={-animOffset}
                    filter="url(#glow-y)" markerEnd="url(#arrow)" />
                </>
              )}

              {startCenter && (
                <g filter="url(#glow-g)">
                  <circle cx={startCenter.x} cy={startCenter.y} r={22} fill="#22c55e" opacity={0.12} />
                  <circle cx={startCenter.x} cy={startCenter.y} r={13} fill="#22c55e" />
                  <circle cx={startCenter.x} cy={startCenter.y} r={13} fill="none" stroke="white" strokeWidth={2.5} />
                  <text x={startCenter.x} y={startCenter.y + 5}
                    textAnchor="middle" fontSize={9} fontFamily="monospace" fill="white" fontWeight="800">
                    ВИ
                  </text>
                  <rect x={startCenter.x - 22} y={startCenter.y - 36} width={44} height={16} rx={4}
                    fill="#166534" opacity={0.9} />
                  <text x={startCenter.x} y={startCenter.y - 25}
                    textAnchor="middle" fontSize={10} fontFamily="monospace" fill="#86efac" fontWeight="700">
                    {startRoom?.name}
                  </text>
                </g>
              )}

              {endCenter && (
                <g filter="url(#glow-r)">
                  <circle cx={endCenter.x} cy={endCenter.y} r={22} fill="#ef4444" opacity={0.12} />
                  <circle cx={endCenter.x} cy={endCenter.y} r={13} fill="#ef4444" />
                  <circle cx={endCenter.x} cy={endCenter.y} r={13} fill="none" stroke="white" strokeWidth={2.5} />
                  <text x={endCenter.x} y={endCenter.y + 5}
                    textAnchor="middle" fontSize={12} fill="white">📍</text>
                  <rect x={endCenter.x - 22} y={endCenter.y - 36} width={44} height={16} rx={4}
                    fill="#7f1d1d" opacity={0.9} />
                  <text x={endCenter.x} y={endCenter.y - 25}
                    textAnchor="middle" fontSize={10} fontFamily="monospace" fill="#fca5a5" fontWeight="700">
                    {endRoom?.name}
                  </text>
                </g>
              )}
            </svg>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <AlertCircle size={32} className="text-slate-600 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">Карту для цього поверху ще не додано</p>
          </div>
        </div>
      )}

      {path && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20" data-no-pan>
          <div className="flex items-center gap-3 bg-slate-900/90 border border-amber-500/30 rounded-2xl px-4 py-2.5 backdrop-blur-sm shadow-xl">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-400 font-bold">{startRoom?.name}</span>
              <ArrowRight size={13} className="text-amber-400" />
              <span className="text-red-400 font-bold">{endRoom?.name}</span>
            </div>
            <div className="text-xs text-slate-500 border-l border-slate-700 pl-3">
              ~{steps} кроків
            </div>
            <button onClick={resetSearch} className="text-slate-500 hover:text-slate-300 transition ml-1">
              <X size={13} />
            </button>
          </div>
        </div>
      )}

      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-2" data-no-pan>
        <button
          onClick={() => setZoom(z => Math.min(4, z * 1.2))}
          className="w-9 h-9 bg-slate-900/80 border border-slate-700/50 rounded-xl text-slate-300 flex items-center justify-center text-lg hover:bg-slate-800 transition backdrop-blur-sm"
        >+</button>
        <button
          onClick={resetView}
          className="w-9 h-9 bg-slate-900/80 border border-slate-700/50 rounded-xl text-slate-400 flex items-center justify-center hover:bg-slate-800 transition backdrop-blur-sm"
        ><RotateCcw size={13} /></button>
        <button
          onClick={() => setZoom(z => Math.max(0.4, z * 0.8))}
          className="w-9 h-9 bg-slate-900/80 border border-slate-700/50 rounded-xl text-slate-300 flex items-center justify-center text-lg hover:bg-slate-800 transition backdrop-blur-sm"
        >−</button>
      </div>
    </div>
  );

  const floorSelector = (
    <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/50 rounded-2xl px-2 py-1.5 backdrop-blur-sm" data-no-pan>
      <Layers size={11} className="text-slate-500 mr-1" />
      {FLOOR_OPTIONS.map(f => {
        const has = maps.some(m => m.floor === f);
        return (
          <button
            key={f}
            disabled={!has}
            onClick={() => has && setActiveFloor(f)}
            className={`w-8 h-8 rounded-xl text-sm font-bold transition ${
              activeFloor === f
                ? 'bg-cyan-500 text-black'
                : has
                  ? 'text-slate-300 hover:bg-slate-700'
                  : 'text-slate-700 cursor-not-allowed'
            }`}
          >
            {f}
          </button>
        );
      })}
    </div>
  );

  return (
    <div
      className="relative h-screen w-full overflow-hidden bg-slate-950 select-none"
      style={{ fontFamily: "'JetBrains Mono', monospace, sans-serif" }}
    >
      <div className="hidden md:flex h-full w-full">
        <aside className="w-72 shrink-0 flex flex-col bg-slate-900 border-r border-slate-800 z-30 overflow-hidden">

          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <Navigation size={15} className="text-cyan-400" />
              <span className="text-sm font-bold text-slate-200">Навігація</span>
            </div>
            {map && (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Building2 size={11} />
                {map.name}
              </span>
            )}
          </div>

          <div className="px-4 py-3 border-b border-slate-800 shrink-0">
            <p className="text-xs text-slate-600 mb-2">Поверх:</p>
            <div className="flex items-center gap-1">
              {FLOOR_OPTIONS.map(f => {
                const has = maps.some(m => m.floor === f);
                return (
                  <button
                    key={f}
                    disabled={!has}
                    onClick={() => has && setActiveFloor(f)}
                    className={`w-9 h-9 rounded-xl text-sm font-bold transition ${
                      activeFloor === f
                        ? 'bg-cyan-500 text-black'
                        : has
                          ? 'text-slate-300 hover:bg-slate-700 border border-slate-700'
                          : 'text-slate-700 cursor-not-allowed border border-slate-800'
                    }`}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <SearchPanel {...searchPanelProps} />
          </div>

          {path && (
            <div className="px-4 py-3 border-t border-slate-800 shrink-0">
              <div className="flex items-center gap-2 text-xs">
                <Route size={12} className="text-amber-400" />
                <span className="text-green-400 font-bold">{startRoom?.name}</span>
                <ArrowRight size={10} className="text-amber-400" />
                <span className="text-red-400 font-bold">{endRoom?.name}</span>
                <span className="text-slate-500 ml-auto">~{steps} кроків</span>
                <button onClick={resetSearch} className="text-slate-600 hover:text-slate-400 ml-1">
                  <X size={12} />
                </button>
              </div>
            </div>
          )}
        </aside>

        <div className="flex-1 relative flex flex-col overflow-hidden">
          {mapCanvas}
        </div>
      </div>

      <div className="flex md:hidden h-full w-full flex-col">

        <div
          className="absolute top-0 left-0 right-0 z-20 px-4 pt-4 pb-2 flex items-center justify-between gap-3"
          style={{ background: 'linear-gradient(to bottom, rgba(2,6,23,0.95) 60%, transparent)' }}
          data-no-pan
        >
          {floorSelector}
          <div className="flex items-center gap-2">
            {map && (
              <span className="text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                {map.name}
              </span>
            )}
            <button
              onClick={resetView}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-900/80 border border-slate-700/50 text-slate-400 hover:text-slate-200 transition backdrop-blur-sm"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        <div className="flex-1 relative overflow-hidden">
          {mapCanvas}
        </div>

        <div
          className="absolute left-0 right-0 bottom-0 z-30 transition-transform duration-300 ease-in-out"
          style={{ transform: drawerOpen ? 'translateY(0)' : 'translateY(calc(100% - 56px))' }}
          data-no-pan
        >
          <div
            className="flex items-center justify-between px-5 py-3.5 bg-slate-900 border-t border-slate-700/60 cursor-pointer rounded-t-3xl"
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
          <div
            className="bg-slate-900 border-t border-slate-800 px-4 pb-8 pt-2"
            style={{ maxHeight: '70vh', overflowY: 'auto' }}
          >
            <SearchPanel {...searchPanelProps} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
