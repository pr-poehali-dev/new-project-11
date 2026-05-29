import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

// ─── Types ────────────────────────────────────────────────────────────────────
type AppView = "desktop" | "ecsu" | "files" | "market" | "settings" | "users";
type UserRole = "admin" | "operator" | "analyst" | "guest";
type IncidentSeverity = "critical" | "warning" | "info";

interface Incident {
  id: string;
  title: string;
  zone: string;
  severity: IncidentSeverity;
  time: string;
  x: number;
  y: number;
  lat: string;
  lng: string;
}

interface ChatMessage {
  role: "user" | "ai";
  text: string;
  time: string;
  source?: string;
}

interface AppItem {
  id: string;
  name: string;
  icon: string;
  version: string;
  installed: boolean;
  category: string;
  rating: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const INCIDENTS: Incident[] = [
  { id: "INC-001", title: "Возгорание на объекте №12", zone: "Северный район", severity: "critical", time: "14:23", x: 28, y: 35, lat: "55.8421", lng: "37.3891" },
  { id: "INC-002", title: "Нарушение периметра", zone: "Западная зона", severity: "warning", time: "14:31", x: 62, y: 55, lat: "55.7612", lng: "37.2341" },
  { id: "INC-003", title: "Датчик CO₂ превышен", zone: "Центральный хаб", severity: "warning", time: "14:45", x: 50, y: 48, lat: "55.7558", lng: "37.6173" },
  { id: "INC-004", title: "Плановая проверка", zone: "Восточный сектор", severity: "info", time: "15:02", x: 75, y: 30, lat: "55.7891", lng: "37.8932" },
  { id: "INC-005", title: "Критический сбой камеры", zone: "Южная граница", severity: "critical", time: "15:11", x: 40, y: 72, lat: "55.6234", lng: "37.5421" },
];

const APPS: AppItem[] = [
  { id: "ecsu", name: "ЕЦСУ", icon: "Globe", version: "1.0.0", installed: true, category: "Безопасность", rating: 5 },
  { id: "mqtt", name: "IoT Брокер", icon: "Wifi", version: "2.1.3", installed: true, category: "Сеть", rating: 4 },
  { id: "reports", name: "Генератор отчётов", icon: "FileText", version: "1.2.1", installed: false, category: "Аналитика", rating: 4 },
  { id: "monitor", name: "Системный монитор", icon: "Activity", version: "3.0.0", installed: true, category: "Система", rating: 5 },
  { id: "vpn", name: "Secure VPN", icon: "Shield", version: "1.5.0", installed: false, category: "Безопасность", rating: 4 },
  { id: "logger", name: "Аудит-логгер", icon: "ScrollText", version: "2.0.1", installed: false, category: "Безопасность", rating: 5 },
];

const INITIAL_CHAT: ChatMessage[] = [
  {
    role: "ai",
    text: "Система ЕЦСУ активирована. Все датчики в сети. Обнаружено 5 инцидентов, из них 2 критических. Чем могу помочь?",
    time: "14:20",
    source: "Локальные данные системы",
  },
];

// ─── StatusBar ────────────────────────────────────────────────────────────────
function StatusBar({ time, role }: { time: string; role: UserRole }) {
  const roleLabels: Record<UserRole, string> = {
    admin: "Администратор",
    operator: "Оператор",
    analyst: "Аналитик",
    guest: "Гость",
  };
  const roleColors: Record<UserRole, string> = {
    admin: "text-red-400",
    operator: "text-yellow-400",
    analyst: "neon-text-cyan",
    guest: "text-gray-400",
  };

  return (
    <div className="h-7 glass-panel border-b border-cyan-500/20 flex items-center justify-between px-4 flex-shrink-0">
      <div className="flex items-center gap-4">
        <span className="font-orbitron text-xs neon-text-cyan font-bold tracking-widest">HYBRID FLOW</span>
        <span className="text-xs text-cyan-500/40">v1.0.0</span>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-blink" />
          <span className="text-xs text-green-400/70">ОНЛАЙН</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Icon name="Cpu" size={12} className="text-cyan-400/60" />
          <span className="text-xs text-cyan-400/60">CPU 23%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Icon name="HardDrive" size={12} className="text-cyan-400/60" />
          <span className="text-xs text-cyan-400/60">RAM 4.2 GB</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Icon name="Shield" size={12} className="text-green-400/80" />
          <span className={`text-xs font-medium ${roleColors[role]}`}>{roleLabels[role]}</span>
        </div>
        <span className="font-orbitron text-xs text-cyan-300/80">{time}</span>
      </div>
    </div>
  );
}

// ─── Taskbar ──────────────────────────────────────────────────────────────────
function Taskbar({ active, onNav }: { active: AppView; onNav: (v: AppView) => void }) {
  const items: { id: AppView; icon: string; label: string }[] = [
    { id: "desktop", icon: "LayoutDashboard", label: "Рабочий стол" },
    { id: "ecsu", icon: "Globe", label: "ЕЦСУ" },
    { id: "files", icon: "FolderOpen", label: "Файлы" },
    { id: "market", icon: "Store", label: "Маркетплейс" },
    { id: "users", icon: "Users", label: "Пользователи" },
    { id: "settings", icon: "Settings", label: "Настройки" },
  ];

  return (
    <div className="h-14 glass-panel-strong border-t border-cyan-500/20 flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onNav(item.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
              ${active === item.id
                ? "bg-cyan-500/15 border border-cyan-500/40 neon-text-cyan shadow-[0_0_15px_rgba(0,245,255,0.15)]"
                : "hover:bg-cyan-500/05 border border-transparent hover:border-cyan-500/20 text-cyan-400/50 hover:text-cyan-300/80"
              }`}
          >
            <Icon name={item.icon} fallback="Circle" size={16} />
            <span className="text-xs font-medium hidden sm:block">{item.label}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded glass-panel">
          <Icon name="Wifi" size={12} className="neon-text-green" />
          <span className="text-xs text-green-400/80">IoT: 47 устр.</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded glass-panel">
          <Icon name="Bell" size={12} className="text-red-400 animate-blink" />
          <span className="text-xs text-red-400">2 крит.</span>
        </div>
      </div>
    </div>
  );
}

// ─── Desktop View ─────────────────────────────────────────────────────────────
function DesktopView({ onNav }: { onNav: (v: AppView) => void }) {
  const apps: { view: AppView; icon: string; label: string; color: string }[] = [
    { view: "ecsu", icon: "Globe", label: "ЕЦСУ", color: "text-cyan-400" },
    { view: "files", icon: "FolderOpen", label: "Файлы", color: "text-yellow-400" },
    { view: "market", icon: "Store", label: "Маркетплейс", color: "text-purple-400" },
    { view: "users", icon: "Users", label: "Пользователи", color: "text-green-400" },
    { view: "settings", icon: "Settings", label: "Настройки", color: "text-gray-400" },
  ];

  return (
    <div className="flex-1 relative cyber-grid scanlines overflow-hidden">
      <div className="absolute top-4 left-4 opacity-30">
        <div className="w-8 h-8 border-t-2 border-l-2 border-cyan-400" />
      </div>
      <div className="absolute top-4 right-4 opacity-30">
        <div className="w-8 h-8 border-t-2 border-r-2 border-cyan-400" />
      </div>
      <div className="absolute bottom-4 left-4 opacity-30">
        <div className="w-8 h-8 border-b-2 border-l-2 border-cyan-400" />
      </div>
      <div className="absolute bottom-4 right-4 opacity-30">
        <div className="w-8 h-8 border-b-2 border-r-2 border-cyan-400" />
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 z-10">
        <div className="text-center">
          <div className="font-orbitron text-4xl font-black neon-text-cyan tracking-widest mb-2">HYBRID FLOW</div>
          <div className="text-sm text-cyan-400/50 tracking-[0.3em] uppercase">Гибридная операционная система</div>
        </div>

        <div className="flex gap-6">
          {apps.map((app) => (
            <button
              key={app.view}
              onClick={() => onNav(app.view)}
              className="flex flex-col items-center gap-2 group animate-fade-in-scale"
            >
              <div className={`w-16 h-16 glass-panel rounded-2xl flex items-center justify-center
                group-hover:scale-110 transition-all duration-200 group-hover:shadow-[0_0_20px_rgba(0,245,255,0.2)]
                ${app.view === "ecsu" ? "animate-neon-pulse" : ""}`}>
                <Icon name={app.icon} fallback="Circle" size={28} className={app.color} />
              </div>
              <span className={`text-xs font-medium ${app.color} opacity-70 group-hover:opacity-100`}>{app.label}</span>
            </button>
          ))}
        </div>

        <div className="flex gap-6 mt-4">
          {[
            { label: "Инциденты", value: "5", color: "text-red-400" },
            { label: "Датчики онлайн", value: "47", color: "neon-text-green" },
            { label: "Камеры", value: "12", color: "neon-text-cyan" },
            { label: "Пользователи", value: "8", color: "text-yellow-400" },
          ].map((s) => (
            <div key={s.label} className="glass-panel rounded-lg px-5 py-3 text-center neon-border">
              <div className={`font-orbitron text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-cyan-400/50 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ЕЦСУ View ────────────────────────────────────────────────────────────────
function ECSUView() {
  const [selected, setSelected] = useState<Incident | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<"map" | "list">("map");
  const chatRef = useRef<HTMLDivElement>(null);

  const sevColor: Record<IncidentSeverity, string> = {
    critical: "neon-text-red",
    warning: "text-yellow-400",
    info: "text-blue-400",
  };
  const sevBg: Record<IncidentSeverity, string> = {
    critical: "bg-red-500/10 border-red-500/30",
    warning: "bg-yellow-500/10 border-yellow-500/30",
    info: "bg-blue-500/10 border-blue-500/30",
  };
  const sevDot: Record<IncidentSeverity, string> = {
    critical: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-blue-400",
  };
  const sevLabel: Record<IncidentSeverity, string> = {
    critical: "КРИТИЧЕСКИЙ",
    warning: "ПРЕДУПРЕЖДЕНИЕ",
    info: "ИНФОРМАЦИЯ",
  };

  const AI_RESPONSES: Record<string, string> = {
    default: "Анализирую данные... Обнаружено 5 активных инцидентов. Рекомендую проверить критические зоны в первую очередь.",
    "инциденты": "Ответ сформирован на основе локальных инцидентов за 24 часа. Активных: 5 (критических: 2, предупреждений: 2, информационных: 1).",
    "критичн": "Критических инцидентов: 2. INC-001 — возгорание в Северном районе (14:23). INC-005 — сбой камеры, Южная граница (15:11). Рекомендую немедленную реакцию.",
    "датчик": "IoT-датчики онлайн: 47 из 52. Превышение CO₂ зафиксировано в Центральном хабе. Последнее обновление: 15 сек. назад.",
    "отчёт": "Генерирую отчёт по инцидентам за сегодня... Формат: PDF. Готов к экспорту. Файл: report_2026-05-29.pdf",
    "радиус": "Применяю фильтр «5 км от центра». Отображены 3 инцидента: INC-002, INC-003, INC-005. Карта обновлена.",
    "камер": "Активных камер: 12 из 14. Камера #7 (Северный район) — офлайн с 13:45. Камера #11 — технический сбой.",
  };

  function sendMessage() {
    if (!input.trim()) return;
    const userMsg: ChatMessage = {
      role: "user",
      text: input,
      time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
    };
    setChatMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const key = Object.keys(AI_RESPONSES).find((k) => input.toLowerCase().includes(k));
      const responseText = key ? AI_RESPONSES[key] : AI_RESPONSES.default;
      const aiMsg: ChatMessage = {
        role: "ai",
        text: responseText,
        time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
        source: "Локальные данные • Llama 3 8B",
      };
      setChatMessages((m) => [...m, aiMsg]);
      setTyping(false);
    }, 1800);
  }

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chatMessages, typing]);

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-10 glass-panel border-b border-cyan-500/20 flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Icon name="Globe" size={16} className="neon-text-cyan" />
            <span className="font-orbitron text-sm font-bold neon-text-cyan tracking-wider">ЕЦСУ</span>
            <span className="text-xs text-cyan-400/40">Единая Центральная Система Управления</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("map")}
              className={`text-xs px-3 py-1 rounded transition-all ${activeTab === "map" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-cyan-400/50 hover:text-cyan-300"}`}
            >
              Карта
            </button>
            <button
              onClick={() => setActiveTab("list")}
              className={`text-xs px-3 py-1 rounded transition-all ${activeTab === "list" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-cyan-400/50 hover:text-cyan-300"}`}
            >
              Список
            </button>
          </div>
        </div>

        {activeTab === "map" ? (
          <div className="flex-1 relative map-grid overflow-hidden">
            <div className="absolute top-3 left-3 z-10 glass-panel px-3 py-1 rounded">
              <span className="text-xs text-cyan-400/60 font-orbitron">ГЕОПРОСТРАНСТВЕННЫЙ ОБЗОР</span>
            </div>
            <div className="absolute top-3 right-3 z-10 glass-panel px-3 py-1 rounded">
              <span className="text-xs text-cyan-400/60">55.7558°N / 37.6173°E</span>
            </div>

            {INCIDENTS.map((inc) => (
              <button
                key={inc.id}
                onClick={() => setSelected(inc)}
                style={{ left: `${inc.x}%`, top: `${inc.y}%` }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 group"
              >
                <div className="relative">
                  <div className={`w-3 h-3 rounded-full ${sevDot[inc.severity]} z-10 relative`} />
                  <div className={`absolute inset-0 w-3 h-3 rounded-full ${sevDot[inc.severity]} animate-ping-slow opacity-60`} />
                </div>
                <div className="absolute left-4 top-0 opacity-0 group-hover:opacity-100 transition-opacity glass-panel rounded px-2 py-1 whitespace-nowrap z-30">
                  <span className={`text-xs font-medium ${sevColor[inc.severity]}`}>{inc.id}</span>
                  <span className="text-xs text-cyan-400/70 ml-1">{inc.zone}</span>
                </div>
              </button>
            ))}

            {selected && (
              <div className="absolute bottom-4 left-4 right-4 glass-panel-strong rounded-xl p-4 border neon-border animate-slide-up z-30">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-orbitron font-bold ${sevColor[selected.severity]}`}>{sevLabel[selected.severity]}</span>
                      <span className="text-xs text-cyan-400/40">• {selected.id}</span>
                    </div>
                    <div className="text-sm font-semibold text-cyan-200">{selected.title}</div>
                    <div className="text-xs text-cyan-400/60 mt-1">{selected.zone} • {selected.time} • {selected.lat}°N {selected.lng}°E</div>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-cyan-400/40 hover:text-cyan-300 ml-4">
                    <Icon name="X" size={16} />
                  </button>
                </div>
              </div>
            )}

            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute" style={{ left: "25%", top: "30%", width: "200px", height: "200px", background: "radial-gradient(circle, rgba(255,45,85,0.12) 0%, transparent 70%)", transform: "translate(-50%,-50%)" }} />
              <div className="absolute" style={{ left: "55%", top: "52%", width: "160px", height: "160px", background: "radial-gradient(circle, rgba(255,180,0,0.10) 0%, transparent 70%)", transform: "translate(-50%,-50%)" }} />
              <div className="absolute" style={{ left: "40%", top: "70%", width: "140px", height: "140px", background: "radial-gradient(circle, rgba(255,45,85,0.10) 0%, transparent 70%)", transform: "translate(-50%,-50%)" }} />
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {INCIDENTS.map((inc) => (
              <button
                key={inc.id}
                onClick={() => { setSelected(inc); setActiveTab("map"); }}
                className={`w-full text-left p-3 rounded-lg border transition-all hover:scale-[1.01] ${sevBg[inc.severity]}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${sevDot[inc.severity]} animate-blink`} />
                    <div>
                      <div className="text-sm font-medium text-cyan-200">{inc.title}</div>
                      <div className="text-xs text-cyan-400/60">{inc.zone} • {inc.lat}°N</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-xs font-orbitron font-bold ${sevColor[inc.severity]}`}>{sevLabel[inc.severity]}</span>
                    <span className="text-xs text-cyan-400/50">{inc.time}</span>
                    <span className="text-xs text-cyan-400/30 font-mono">{inc.id}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right panel: Stats + Chat */}
      <div className="w-80 flex flex-col border-l border-cyan-500/20 flex-shrink-0">
        <div className="glass-panel border-b border-cyan-500/20 p-3 flex-shrink-0">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Критических", value: "2", color: "text-red-400" },
              { label: "Предупреждений", value: "2", color: "text-yellow-400" },
              { label: "Датчиков", value: "47", color: "neon-text-green" },
              { label: "Камер онлайн", value: "12", color: "neon-text-cyan" },
            ].map((s) => (
              <div key={s.label} className="bg-cyan-500/5 rounded-lg p-2 text-center">
                <div className={`font-orbitron text-lg font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-cyan-400/50">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-10 flex items-center gap-2 px-4 border-b border-cyan-500/20 flex-shrink-0">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-blink" />
          <span className="text-xs font-orbitron text-cyan-400/70 tracking-wider">ИИ-АССИСТЕНТ</span>
          <span className="text-xs text-cyan-400/30 ml-auto">Llama 3 8B</span>
        </div>

        <div ref={chatRef} className="flex-1 overflow-y-auto p-3 space-y-3 chat-scroll">
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
              <div
                className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed
                  ${msg.role === "user"
                    ? "bg-cyan-500/20 border border-cyan-500/30 text-cyan-200"
                    : "bg-white/5 border border-white/10 text-cyan-100"
                  }`}
              >
                {msg.text}
                {msg.source && (
                  <div className="text-cyan-400/40 text-[10px] mt-1 border-t border-cyan-500/20 pt-1">
                    {msg.source}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-cyan-400/30 mt-1 px-1">{msg.time}</span>
            </div>
          ))}
          {typing && (
            <div className="flex items-start">
              <div className="glass-panel rounded-xl px-3 py-2 border border-cyan-500/20">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-1.5 h-1.5 bg-cyan-400/60 rounded-full animate-blink" style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-3 border-t border-cyan-500/20 flex-shrink-0">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Введите команду..."
              className="flex-1 bg-cyan-500/5 border border-cyan-500/20 rounded-lg px-3 py-2 text-xs text-cyan-200 placeholder-cyan-400/30 outline-none focus:border-cyan-500/50 focus:bg-cyan-500/10 transition-all"
            />
            <button
              onClick={sendMessage}
              className="px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 rounded-lg transition-all hover:shadow-[0_0_10px_rgba(0,245,255,0.2)]"
            >
              <Icon name="Send" size={14} className="neon-text-cyan" />
            </button>
          </div>
          <div className="flex gap-1 mt-2 flex-wrap">
            {["Инциденты сегодня", "Критические зоны", "Камеры офлайн"].map((hint) => (
              <button
                key={hint}
                onClick={() => setInput(hint)}
                className="text-[10px] text-cyan-400/40 hover:text-cyan-400/70 border border-cyan-500/15 hover:border-cyan-500/30 rounded px-2 py-0.5 transition-all"
              >
                {hint}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Files View ───────────────────────────────────────────────────────────────
function FilesView() {
  const files = [
    { name: "apps", type: "dir", size: "—", date: "29.05.2026" },
    { name: "data", type: "dir", size: "—", date: "29.05.2026" },
    { name: "plugins", type: "dir", size: "—", date: "28.05.2026" },
    { name: "marketplace", type: "dir", size: "—", date: "27.05.2026" },
    { name: "system", type: "dir", size: "—", date: "29.05.2026" },
    { name: "config.json", type: "file", size: "4.2 KB", date: "29.05.2026" },
    { name: "audit.log", type: "file", size: "128 KB", date: "29.05.2026" },
    { name: "manifest.hflowapp", type: "file", size: "2.1 KB", date: "25.05.2026" },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="h-10 glass-panel border-b border-cyan-500/20 flex items-center gap-3 px-4 flex-shrink-0">
        <Icon name="FolderOpen" size={16} className="text-yellow-400" />
        <span className="font-orbitron text-sm font-bold text-yellow-400">ФАЙЛОВЫЙ МЕНЕДЖЕР</span>
        <span className="text-xs text-cyan-400/40 ml-2">~/.hybridflow/</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <table className="w-full">
          <thead>
            <tr className="border-b border-cyan-500/20">
              {["Имя", "Тип", "Размер", "Дата"].map((h) => (
                <th key={h} className="text-left text-xs text-cyan-400/50 font-medium pb-2 pr-6">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {files.map((f) => (
              <tr key={f.name} className="border-b border-cyan-500/10 hover:bg-cyan-500/05 transition-colors group cursor-pointer">
                <td className="py-2 pr-6">
                  <div className="flex items-center gap-2">
                    <Icon name={f.type === "dir" ? "Folder" : "File"} size={14} className={f.type === "dir" ? "text-yellow-400/70" : "text-cyan-400/50"} />
                    <span className="text-sm text-cyan-200 group-hover:text-cyan-300 transition-colors">{f.name}</span>
                  </div>
                </td>
                <td className="py-2 pr-6 text-xs text-cyan-400/50">{f.type === "dir" ? "Папка" : "Файл"}</td>
                <td className="py-2 pr-6 text-xs text-cyan-400/50">{f.size}</td>
                <td className="py-2 text-xs text-cyan-400/50">{f.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 p-3 glass-panel rounded-lg text-xs text-cyan-400/50">
          <Icon name="HardDrive" size={12} className="inline mr-2" />
          Доступно: 148.3 GB / Всего: 256 GB
        </div>
      </div>
    </div>
  );
}

// ─── Marketplace View ─────────────────────────────────────────────────────────
function MarketView() {
  const [apps, setApps] = useState(APPS);
  const [installing, setInstalling] = useState<string | null>(null);

  function toggle(id: string) {
    if (installing) return;
    const app = apps.find((a) => a.id === id);
    if (app?.installed) {
      setApps((prev) => prev.map((a) => a.id === id ? { ...a, installed: false } : a));
    } else {
      setInstalling(id);
      setTimeout(() => {
        setApps((prev) => prev.map((a) => a.id === id ? { ...a, installed: true } : a));
        setInstalling(null);
      }, 1500);
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="h-10 glass-panel border-b border-cyan-500/20 flex items-center gap-3 px-4 flex-shrink-0">
        <Icon name="Store" size={16} className="text-purple-400" />
        <span className="font-orbitron text-sm font-bold text-purple-400">МАРКЕТПЛЕЙС</span>
        <span className="text-xs text-cyan-400/40 ml-2">{apps.filter((a) => a.installed).length} установлено</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-3 gap-3 content-start">
        {apps.map((app) => (
          <div key={app.id} className={`glass-panel rounded-xl p-4 border transition-all ${app.installed ? "neon-border-green" : "neon-border"}`}>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${app.installed ? "bg-green-500/15" : "bg-cyan-500/10"}`}>
                <Icon name={app.icon} fallback="Circle" size={20} className={app.installed ? "text-green-400" : "text-cyan-400/70"} />
              </div>
              {app.installed && <Icon name="CheckCircle" size={14} className="text-green-400" />}
            </div>
            <div className="text-sm font-semibold text-cyan-200 mb-1">{app.name}</div>
            <div className="text-xs text-cyan-400/50 mb-1">v{app.version} • {app.category}</div>
            <div className="flex mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Icon key={i} name="Star" size={10} className={i < app.rating ? "text-yellow-400" : "text-cyan-400/20"} />
              ))}
            </div>
            <button
              onClick={() => toggle(app.id)}
              className={`w-full text-xs py-1.5 rounded-lg border transition-all font-medium
                ${app.installed
                  ? "border-red-500/30 text-red-400/80 hover:bg-red-500/10"
                  : installing === app.id
                    ? "border-cyan-500/30 text-cyan-400/50 cursor-wait"
                    : "border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                }`}
            >
              {app.installed ? "Удалить" : installing === app.id ? "Установка..." : "Установить"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Users View ───────────────────────────────────────────────────────────────
function UsersView() {
  const users = [
    { name: "Иванов А.П.", role: "admin" as UserRole, status: "online", last: "Сейчас" },
    { name: "Петрова М.К.", role: "analyst" as UserRole, status: "online", last: "Сейчас" },
    { name: "Сидоров Д.В.", role: "operator" as UserRole, status: "online", last: "10 мин назад" },
    { name: "Козлова Н.Р.", role: "operator" as UserRole, status: "offline", last: "2 часа назад" },
    { name: "Гость-001", role: "guest" as UserRole, status: "online", last: "Сейчас" },
  ];
  const roleColors: Record<UserRole, string> = {
    admin: "text-red-400 bg-red-500/10 border-red-500/30",
    operator: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
    analyst: "text-cyan-300 bg-cyan-500/10 border-cyan-500/30",
    guest: "text-gray-400 bg-gray-500/10 border-gray-500/30",
  };
  const roleLabels: Record<UserRole, string> = { admin: "Администратор", operator: "Оператор", analyst: "Аналитик", guest: "Гость" };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="h-10 glass-panel border-b border-cyan-500/20 flex items-center gap-3 px-4 flex-shrink-0">
        <Icon name="Users" size={16} className="text-green-400" />
        <span className="font-orbitron text-sm font-bold text-green-400">ПОЛЬЗОВАТЕЛИ</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {users.map((u) => (
          <div key={u.name} className="glass-panel rounded-xl p-4 border neon-border flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <Icon name="User" size={20} className="text-cyan-400/70" />
              </div>
              <div>
                <div className="text-sm font-semibold text-cyan-200">{u.name}</div>
                <div className="text-xs text-cyan-400/50">Последняя активность: {u.last}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-medium px-2 py-1 rounded border ${roleColors[u.role]}`}>{roleLabels[u.role]}</span>
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded ${u.status === "online" ? "bg-green-500/10" : "bg-gray-500/10"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${u.status === "online" ? "bg-green-400 animate-blink" : "bg-gray-500"}`} />
                <span className={`text-xs ${u.status === "online" ? "text-green-400" : "text-gray-500"}`}>{u.status === "online" ? "Онлайн" : "Офлайн"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Settings View ────────────────────────────────────────────────────────────
function SettingsView() {
  const [mqttEnabled, setMqttEnabled] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [auditLog, setAuditLog] = useState(true);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="h-10 glass-panel border-b border-cyan-500/20 flex items-center gap-3 px-4 flex-shrink-0">
        <Icon name="Settings" size={16} className="text-gray-400" />
        <span className="font-orbitron text-sm font-bold text-gray-300">НАСТРОЙКИ</span>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <Section title="Система">
          <SettingRow label="Версия ОС" value="HYBRID FLOW v1.0.0" />
          <SettingRow label="Ядро" value="HF-Kernel 5.4.2" />
          <SettingRow label="Архитектура" value="x86_64 / ARM64" />
        </Section>
        <Section title="Безопасность">
          <ToggleRow label="MQTT-брокер" desc="Локальный IoT-брокер Mosquitto" on={mqttEnabled} onToggle={setMqttEnabled} />
          <ToggleRow label="Аудит действий" desc="Фиксация всех событий в журнале" on={auditLog} onToggle={setAuditLog} />
          <ToggleRow label="Оффлайн-режим" desc="Работа без интернет-соединения" on={offlineMode} onToggle={setOfflineMode} />
          <SettingRow label="Шифрование БД" value="SQLCipher AES-256" />
        </Section>
        <Section title="ИИ-движок">
          <SettingRow label="Модель" value="Llama 3 8B GGUF" />
          <SettingRow label="Провайдер" value="Ollama (локальный)" />
          <SettingRow label="Макс. время ответа" value="5 сек." />
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-orbitron text-cyan-400/50 tracking-widest mb-3 uppercase">{title}</div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-panel rounded-lg p-3 flex items-center justify-between border neon-border">
      <span className="text-sm text-cyan-300/80">{label}</span>
      <span className="text-xs text-cyan-400/60 font-mono">{value}</span>
    </div>
  );
}

function ToggleRow({ label, desc, on, onToggle }: { label: string; desc: string; on: boolean; onToggle: (v: boolean) => void }) {
  return (
    <div className="glass-panel rounded-lg p-3 flex items-center justify-between border neon-border">
      <div>
        <div className="text-sm text-cyan-300/80">{label}</div>
        <div className="text-xs text-cyan-400/40">{desc}</div>
      </div>
      <button
        onClick={() => onToggle(!on)}
        className={`w-10 h-5 rounded-full transition-all duration-300 relative flex-shrink-0 ml-4
          ${on ? "bg-cyan-500/40 border border-cyan-500/60" : "bg-white/10 border border-white/20"}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-300 ${on ? "left-5 bg-cyan-400" : "left-0.5 bg-gray-500"}`} />
      </button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Index() {
  const [view, setView] = useState<AppView>("desktop");
  const [role] = useState<UserRole>("analyst");
  const [time, setTime] = useState(
    new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  );

  useEffect(() => {
    const t = setInterval(() => {
      setTime(new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#060c14]">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-cyan-400/4 rounded-full blur-3xl" />
      </div>

      <StatusBar time={time} role={role} />

      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {view === "desktop" && <DesktopView onNav={setView} />}
        {view === "ecsu" && <ECSUView />}
        {view === "files" && <FilesView />}
        {view === "market" && <MarketView />}
        {view === "users" && <UsersView />}
        {view === "settings" && <SettingsView />}
      </div>

      <Taskbar active={view} onNav={setView} />
    </div>
  );
}