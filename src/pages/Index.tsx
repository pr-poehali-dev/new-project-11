/**
 * Проект: HYBRID FLOW + ЕЦСУ
 * Описание: Гибридная ОС и система управления инцидентами
 * Создатель и владелец: Николаев Владимир Владимирович
 * Дата создания: 2026-05-29
 * Лицензия: Определяется правообладателем
 */

import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

// ─── Types ────────────────────────────────────────────────────────────────────
type AppView = "desktop" | "ecsu" | "files" | "market" | "settings" | "users" | "about";
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

// ─── Mock Data ────────────────────────────────────────────────────────────────
const INCIDENTS: Incident[] = [
  { id: "INC-001", title: "Возгорание на объекте №12", zone: "Северный район", severity: "critical", time: "14:23", x: 28, y: 35, lat: "55.8421", lng: "37.3891" },
  { id: "INC-002", title: "Нарушение периметра", zone: "Западная зона", severity: "warning", time: "14:31", x: 62, y: 55, lat: "55.7612", lng: "37.2341" },
  { id: "INC-003", title: "Датчик CO₂ превышен", zone: "Центральный хаб", severity: "warning", time: "14:45", x: 50, y: 48, lat: "55.7558", lng: "37.6173" },
  { id: "INC-004", title: "Плановая проверка", zone: "Восточный сектор", severity: "info", time: "15:02", x: 75, y: 30, lat: "55.7891", lng: "37.8932" },
  { id: "INC-005", title: "Критический сбой камеры", zone: "Южная граница", severity: "critical", time: "15:11", x: 40, y: 72, lat: "55.6234", lng: "37.5421" },
];

interface AppItem {
  id: string;
  name: string;
  icon: string;
  version: string;
  installed: boolean;
  category: string;
  rating: number;
  developer?: string;
}

const APPS: AppItem[] = [
  { id: "ecsu", name: "ЕЦСУ", icon: "Globe", version: "1.0.0", installed: true, category: "Безопасность", rating: 5, developer: "Николаев В.В." },
  { id: "mqtt", name: "IoT Брокер", icon: "Wifi", version: "2.1.3", installed: true, category: "Сеть", rating: 4, developer: "Николаев В.В." },
  { id: "reports", name: "Генератор отчётов", icon: "FileText", version: "1.2.1", installed: false, category: "Аналитика", rating: 4, developer: "Николаев В.В." },
  { id: "monitor", name: "Системный монитор", icon: "Activity", version: "3.0.0", installed: true, category: "Система", rating: 5, developer: "Николаев В.В." },
  { id: "vpn", name: "Secure VPN", icon: "Shield", version: "1.5.0", installed: false, category: "Безопасность", rating: 4, developer: "Николаев В.В." },
  { id: "logger", name: "Аудит-логгер", icon: "ScrollText", version: "2.0.1", installed: false, category: "Безопасность", rating: 5, developer: "Николаев В.В." },
];

const INITIAL_CHAT: ChatMessage[] = [
  {
    role: "ai",
    text: "Добро пожаловать в ЕЦСУ. Система разработана Николаевым Владимиром Владимировичем. Для справки введите «Помощь».",
    time: "14:20",
    source: "Системное сообщение",
  },
  {
    role: "ai",
    text: "Система активирована. Все датчики в сети. Обнаружено 5 инцидентов, из них 2 критических. Чем могу помочь?",
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
        <div className="flex items-center gap-1.5 border-l border-cyan-500/20 pl-4">
          <Icon name="Copyright" size={10} className="text-cyan-400/35" />
          <span className="text-[10px] text-cyan-400/35 tracking-wide">Николаев В.В.</span>
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
    { id: "about", icon: "Info", label: "Справка" },
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
            {app.developer && (
              <div className="flex items-center gap-1 mb-1">
                <Icon name="User" size={10} className="text-cyan-400/35" />
                <span className="text-[10px] text-cyan-400/45">{app.developer}</span>
              </div>
            )}
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
      <div className="glass-panel border-t border-cyan-500/20 px-4 py-2 flex-shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon name="Info" size={12} className="text-cyan-400/40" />
          <span className="text-xs text-cyan-400/40">Платформа разработана при участии Николаева В.В.</span>
        </div>
        <div className="flex items-center gap-1">
          <Icon name="Copyright" size={10} className="text-cyan-400/30" />
          <span className="text-[10px] text-cyan-400/30">2026 Николаев В.В. Все права защищены.</span>
        </div>
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
        <Section title="Системный журнал">
          <div className="glass-panel rounded-xl border neon-border overflow-hidden">
            <div className="px-3 py-2 border-b border-cyan-500/15 flex items-center justify-between">
              <span className="text-xs text-cyan-400/50 font-mono">~/.hybridflow/system/logs/install.log</span>
              <Icon name="Terminal" size={12} className="text-cyan-400/40" />
            </div>
            <div className="p-3 space-y-1 font-mono text-[11px]">
              {[
                { level: "INFO", text: "HYBRID FLOW + ЕЦСУ v1.0.0. Правообладатель: Николаев В.В." },
                { level: "INFO", text: "Инициализация ядра HF-Kernel 5.4.2 завершена." },
                { level: "INFO", text: "IoT-брокер Mosquitto запущен на порту 1883." },
                { level: "INFO", text: "ИИ-движок Llama 3 8B загружен успешно." },
                { level: "INFO", text: "Монтирование зашифрованной БД SQLCipher завершено." },
              ].map((entry, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-green-400/70 flex-shrink-0">[{entry.level}]</span>
                  <span className="text-cyan-300/60">{entry.text}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>
        <Section title="Правообладатель">
          <div className="glass-panel rounded-xl p-4 border neon-border space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                <Icon name="Copyright" size={16} className="text-cyan-400/70" />
              </div>
              <div>
                <div className="text-sm font-semibold text-cyan-200">Николаев Владимир Владимирович</div>
                <div className="text-xs text-cyan-400/50">Создатель и владелец исключительных прав</div>
              </div>
            </div>
            <div className="border-t border-cyan-500/15 pt-3 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-xs text-cyan-400/50">Проект</span>
                <span className="text-xs text-cyan-300/70 font-mono">HYBRID FLOW + ЕЦСУ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-cyan-400/50">Дата создания</span>
                <span className="text-xs text-cyan-300/70 font-mono">29.05.2026</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-cyan-400/50">Лицензия</span>
                <span className="text-xs text-cyan-300/70 font-mono">Определяется правообладателем</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-cyan-400/50">Коммерческое использование</span>
                <span className="text-xs text-yellow-400/80 font-mono">По согласованию</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-cyan-500/10">
                <span className="text-xs text-cyan-400/50">Телефон</span>
                <a href="tel:+79069612034" className="text-xs text-cyan-300/80 font-mono hover:neon-text-cyan transition-colors">+7 906 961-20-34</a>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-cyan-400/50">E-mail</span>
                <a href="mailto:nikolaevvladimir77@yandex.ru" className="text-xs text-cyan-300/80 font-mono hover:neon-text-cyan transition-colors">nikolaevvladimir77@yandex.ru</a>
              </div>
            </div>
            <div className="bg-cyan-500/5 rounded-lg px-3 py-2 text-[11px] text-cyan-400/50 leading-relaxed border border-cyan-500/10">
              Исходный код, дизайн интерфейса, документация и сопутствующие материалы защищены авторским правом.
            </div>
          </div>
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

// ─── About View ───────────────────────────────────────────────────────────────
function AboutView() {
  const [eulaOpen, setEulaOpen] = useState(false);

  const eulaItems = [
    "Все права на программное обеспечение, включая ОС HYBRID FLOW и систему ЕЦСУ, принадлежат Николаеву Владимиру Владимировичу.",
    "Любое коммерческое использование, модификация или распространение компонентов проекта требует предварительного письменного согласия правообладателя.",
    "Пользователь не имеет права удалять или изменять упоминания о правообладателе в интерфейсе или коде системы.",
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="h-10 glass-panel border-b border-cyan-500/20 flex items-center gap-3 px-4 flex-shrink-0">
        <Icon name="Info" size={16} className="text-cyan-400" />
        <span className="font-orbitron text-sm font-bold text-cyan-300">СПРАВКА / О ПРОГРАММЕ</span>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Hero copyright block */}
        <div className="relative glass-panel-strong rounded-2xl p-6 border neon-border overflow-hidden">
          <div className="absolute inset-0 cyber-grid opacity-30" />
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 animate-neon-pulse">
              <span className="font-orbitron text-2xl font-black neon-text-cyan">HF</span>
            </div>
            <div>
              <div className="font-orbitron text-xl font-black neon-text-cyan tracking-wider mb-1">HYBRID FLOW + ЕЦСУ</div>
              <div className="text-sm text-cyan-300/70">Гибридная ОС и система управления инцидентами</div>
              <div className="text-xs text-cyan-400/50 mt-1 font-mono">Версия 1.0.0 • Сборка 2026.05.29</div>
            </div>
          </div>
          <div className="relative z-10 mt-4 pt-4 border-t border-cyan-500/15">
            <div className="flex items-center gap-2">
              <Icon name="Copyright" size={14} className="text-cyan-400/60" />
              <span className="text-sm text-cyan-200 font-medium">Николаев Владимир Владимирович, 2026. Все права защищены.</span>
            </div>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Разработчик", value: "Николаев В.В.", icon: "User" },
            { label: "Лицензия", value: "Определяется правообладателем", icon: "FileCheck" },
            { label: "Коммерческое использование", value: "По письменному согласованию", icon: "Handshake" },
            { label: "Распространение", value: "С разрешения правообладателя", icon: "Share2" },
          ].map((item) => (
            <div key={item.label} className="glass-panel rounded-xl p-4 border neon-border">
              <div className="flex items-center gap-2 mb-2">
                <Icon name={item.icon} fallback="Circle" size={14} className="text-cyan-400/60" />
                <span className="text-xs text-cyan-400/50">{item.label}</span>
              </div>
              <div className="text-sm font-medium text-cyan-200">{item.value}</div>
            </div>
          ))}
        </div>

        {/* EULA button + modal */}
        <div className="glass-panel rounded-xl p-4 border neon-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icon name="ScrollText" size={16} className="text-yellow-400" />
              <span className="text-sm font-semibold text-cyan-200">Лицензионное соглашение (EULA)</span>
            </div>
            <button
              onClick={() => setEulaOpen(!eulaOpen)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all font-medium
                ${eulaOpen ? "bg-cyan-500/20 border-cyan-500/40 neon-text-cyan" : "border-cyan-500/25 text-cyan-400/70 hover:border-cyan-500/40 hover:text-cyan-300"}`}
            >
              {eulaOpen ? "Свернуть" : "Читать соглашение"}
            </button>
          </div>

          {eulaOpen && (
            <div className="space-y-3 animate-fade-in-scale">
              <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <Icon name="AlertTriangle" size={12} className="text-yellow-400" />
                  <span className="text-xs font-semibold text-yellow-400">Обязательно к прочтению</span>
                </div>
                <span className="text-xs text-yellow-400/70">Используя данное ПО, вы подтверждаете согласие со всеми нижеперечисленными условиями.</span>
              </div>
              {eulaItems.map((item, i) => (
                <div key={i} className="flex gap-3 p-3 bg-cyan-500/5 rounded-lg border border-cyan-500/10">
                  <span className="font-orbitron text-xs font-bold neon-text-cyan flex-shrink-0 mt-0.5">{i + 1}.</span>
                  <span className="text-sm text-cyan-200/80 leading-relaxed">{item}</span>
                </div>
              ))}
              <div className="text-xs text-cyan-400/40 text-center pt-1">
                HYBRID FLOW EULA v1.0 • Правообладатель: Николаев Владимир Владимирович
              </div>
            </div>
          )}
        </div>

        {/* Component list */}
        <div className="glass-panel rounded-xl p-4 border neon-border">
          <div className="text-xs font-orbitron text-cyan-400/50 tracking-widest mb-3 uppercase">Компоненты системы</div>
          <div className="space-y-2">
            {[
              { name: "HYBRID FLOW OS", desc: "Гибридная операционная система", version: "1.0.0" },
              { name: "ЕЦСУ", desc: "Единая Центральная Система Управления", version: "1.0.0" },
              { name: "IoT Брокер (MQTT)", desc: "Mosquitto — локальный брокер сообщений", version: "2.1.3" },
              { name: "ИИ-движок", desc: "Llama 3 8B GGUF via Ollama", version: "3.8.0" },
            ].map((c) => (
              <div key={c.name} className="flex items-center justify-between py-2 border-b border-cyan-500/10 last:border-0">
                <div>
                  <span className="text-sm text-cyan-200 font-medium">{c.name}</span>
                  <span className="text-xs text-cyan-400/50 ml-3">{c.desc}</span>
                </div>
                <span className="text-xs text-cyan-400/40 font-mono">v{c.version}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Boot Screen ──────────────────────────────────────────────────────────────
function BootScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);

  const phases = [
    "Инициализация ядра HF-Kernel 5.4.2...",
    "Загрузка модулей безопасности...",
    "Запуск IoT-брокера Mosquitto...",
    "Инициализация ИИ-движка Llama 3 8B...",
    "Монтирование зашифрованной БД...",
    "Система готова.",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + 2;
        setPhase(Math.floor((next / 100) * phases.length));
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(onDone, 600);
        }
        return Math.min(next, 100);
      });
    }, 40);
    return () => clearInterval(interval);
  }, [onDone]);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#020810] relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 cyber-grid opacity-40" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-cyan-500/6 rounded-full blur-3xl" />

      {/* Corner brackets */}
      {[
        "top-6 left-6 border-t-2 border-l-2",
        "top-6 right-6 border-t-2 border-r-2",
        "bottom-6 left-6 border-b-2 border-l-2",
        "bottom-6 right-6 border-b-2 border-r-2",
      ].map((cls, i) => (
        <div key={i} className={`absolute w-10 h-10 border-cyan-400/50 ${cls}`} />
      ))}

      <div className="relative z-10 flex flex-col items-center gap-8 w-80">
        {/* Logo */}
        <div className="text-center">
          <div className="font-orbitron text-5xl font-black neon-text-cyan tracking-[0.2em] mb-2">
            HYBRID
          </div>
          <div className="font-orbitron text-5xl font-black text-cyan-400/40 tracking-[0.2em]">
            FLOW
          </div>
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent mx-auto mt-3" />
        </div>

        {/* Developer line */}
        <div className="text-center space-y-1">
          <div className="text-xs text-cyan-400/50 tracking-widest uppercase font-orbitron">Разработчик</div>
          <div className="text-sm text-cyan-200/80 font-medium">Николаев Владимир Владимирович</div>
          <div className="text-xs text-cyan-400/35">HYBRID FLOW + ЕЦСУ • 2026</div>
        </div>

        {/* Progress bar */}
        <div className="w-full space-y-3">
          <div className="h-1 w-full bg-cyan-500/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 rounded-full transition-all duration-75 shadow-[0_0_8px_rgba(0,245,255,0.6)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-cyan-400/50 font-mono min-h-4">
              {phases[Math.min(phase, phases.length - 1)]}
            </span>
            <span className="font-orbitron text-xs neon-text-cyan">{progress}%</span>
          </div>
        </div>

        {/* Copyright footer */}
        <div className="text-center border-t border-cyan-500/15 pt-4 w-full">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Icon name="Copyright" size={11} className="text-cyan-400/35" />
            <span className="text-[11px] text-cyan-400/35">Николаев Владимир Владимирович, 2026. Все права защищены.</span>
          </div>
          <div className="text-[10px] text-cyan-400/25">Лицензия определяется правообладателем</div>
        </div>
      </div>
    </div>
  );
}

// ─── Install Wizard ───────────────────────────────────────────────────────────
function InstallWizard({ onAccept }: { onAccept: () => void }) {
  const [checked, setChecked] = useState(false);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#020810] relative overflow-hidden">
      <div className="absolute inset-0 cyber-grid opacity-30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-cyan-500/5 rounded-full blur-3xl" />

      {[
        "top-6 left-6 border-t-2 border-l-2",
        "top-6 right-6 border-t-2 border-r-2",
        "bottom-6 left-6 border-b-2 border-l-2",
        "bottom-6 right-6 border-b-2 border-r-2",
      ].map((cls, i) => (
        <div key={i} className={`absolute w-10 h-10 border-cyan-400/40 ${cls}`} />
      ))}

      <div className="relative z-10 w-[480px] glass-panel-strong rounded-2xl border neon-border p-8 space-y-6 animate-fade-in-scale">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center mx-auto mb-3">
            <Icon name="PackageOpen" size={24} className="neon-text-cyan" />
          </div>
          <div className="font-orbitron text-xl font-black neon-text-cyan tracking-wider">МАСТЕР УСТАНОВКИ</div>
          <div className="text-xs text-cyan-400/50 tracking-widest uppercase font-orbitron">HYBRID FLOW + ЕЦСУ v1.0.0</div>
        </div>

        {/* Notice block */}
        <div className="bg-yellow-500/6 border border-yellow-500/25 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="AlertTriangle" size={14} className="text-yellow-400 flex-shrink-0" />
            <span className="text-xs font-semibold text-yellow-400 font-orbitron tracking-wide">ЛИЦЕНЗИОННОЕ УВЕДОМЛЕНИЕ</span>
          </div>
          <p className="text-sm text-yellow-200/80 leading-relaxed">
            Данное ПО принадлежит <span className="text-yellow-300 font-semibold">Николаеву В. В.</span> Продолжив установку, вы соглашаетесь с лицензионным соглашением (LICENSE.txt).
          </p>
        </div>

        {/* Key terms */}
        <div className="space-y-2">
          <div className="text-xs font-orbitron text-cyan-400/50 tracking-widest uppercase mb-2">Ключевые условия</div>
          {[
            "Все права на ПО принадлежат Николаеву Владимиру Владимировичу",
            "Коммерческое использование требует письменного согласия",
            "Удаление атрибуции правообладателя запрещено",
          ].map((item, i) => (
            <div key={i} className="flex gap-2.5 items-start">
              <span className="font-orbitron text-[10px] font-bold neon-text-cyan mt-0.5 flex-shrink-0">{i + 1}.</span>
              <span className="text-xs text-cyan-200/70 leading-relaxed">{item}</span>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="bg-cyan-500/5 rounded-lg px-3 py-2.5 border border-cyan-500/15 flex items-center justify-between">
          <span className="text-xs text-cyan-400/50">По вопросам лицензирования:</span>
          <div className="text-right">
            <div className="text-xs text-cyan-300/80 font-mono">+7 906 961-20-34</div>
            <div className="text-[10px] text-cyan-400/50 font-mono">nikolaevvladimir77@yandex.ru</div>
          </div>
        </div>

        {/* Checkbox + button */}
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div
              onClick={() => setChecked(!checked)}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all
                ${checked ? "bg-cyan-500/30 border-cyan-400 shadow-[0_0_8px_rgba(0,245,255,0.3)]" : "border-cyan-500/30 group-hover:border-cyan-500/60"}`}
            >
              {checked && <Icon name="Check" size={12} className="neon-text-cyan" />}
            </div>
            <span className="text-xs text-cyan-300/70 leading-relaxed">
              Я прочитал(а) и соглашаюсь с условиями лицензионного соглашения
            </span>
          </label>

          <button
            onClick={() => checked && onAccept()}
            className={`w-full py-3 rounded-xl font-orbitron text-sm font-bold tracking-wider transition-all duration-200
              ${checked
                ? "bg-cyan-500/20 border border-cyan-500/50 neon-text-cyan hover:bg-cyan-500/30 hover:shadow-[0_0_20px_rgba(0,245,255,0.2)] cursor-pointer"
                : "bg-white/5 border border-white/10 text-white/20 cursor-not-allowed"
              }`}
          >
            ПРИНЯТЬ И ПРОДОЛЖИТЬ
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Index() {
  const [booting, setBooting] = useState(true);
  const [wizardDone, setWizardDone] = useState(false);
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

  if (booting) return <BootScreen onDone={() => setBooting(false)} />;
  if (!wizardDone) return <InstallWizard onAccept={() => setWizardDone(true)} />;

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
        {view === "about" && <AboutView />}
      </div>

      <Taskbar active={view} onNav={setView} />
    </div>
  );
}