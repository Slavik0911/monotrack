import {
  ArrowLeftRight,
  Bell,
  Bot,
  LayoutDashboard,
  Menu,
  Settings,
  Wallet,
} from "lucide-react";

const navigation = [
  { label: "Панель управління", Icon: LayoutDashboard, path: "/" },
  { label: "Транзакції", Icon: ArrowLeftRight, path: "/transactions" },
  { label: "Бюджет", Icon: Wallet },
  { label: "AI Помічник", Icon: Bot },
];

export default function Header({ activePath = "/", onNavigate }) {
  return (
    <header className="border-b border-[#1B1D23] bg-[#0B0C0F]">
      <div className="mx-auto flex h-[72px] w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-12 xl:px-16">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-[#E4BD67]" aria-hidden="true" />
          <span className="text-[19px] font-semibold tracking-[-0.01em] text-white">
            Monotrack
          </span>
        </div>

        <nav className="hidden h-full items-center gap-3 lg:flex">
          {navigation.map(({ label, Icon, path }) => {
            const active =
              path === "/" ? activePath === "/" : path && activePath.startsWith(path);

            return (
            <a
              href={path ?? "#"}
              key={label}
              onClick={(event) => {
                event.preventDefault();
                if (path) {
                  onNavigate?.(path);
                }
              }}
              className={`flex h-full items-center gap-2 border-b px-3 text-[13px] transition ${
                active
                  ? "border-[#E4BD67] text-white"
                  : "border-transparent text-[#788092] hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={1.7} />
              {label}
            </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 text-[#7A7E87] sm:gap-4">
          <button
            className="hidden h-9 w-9 items-center justify-center rounded-full transition hover:bg-[#121318] hover:text-white sm:flex"
            aria-label="Сповіщення"
            type="button"
          >
            <Bell className="h-4 w-4" strokeWidth={1.7} />
          </button>
          <button
            className="hidden h-9 w-9 items-center justify-center rounded-full transition hover:bg-[#121318] hover:text-white sm:flex"
            aria-label="Налаштування"
            type="button"
          >
            <Settings className="h-4 w-4" strokeWidth={1.7} />
          </button>

          <div className="flex items-center gap-3 pl-2 sm:border-l sm:border-[#1B1D23] sm:pl-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D6AE4D] text-[11px] font-semibold text-[#101116]">
              АК
            </div>
            <div className="hidden leading-tight sm:block">
              <p className="text-[12px] font-medium text-white">Микола К.</p>
              <p className="mt-0.5 text-[10px] text-[#7A7E87]">Premium</p>
            </div>
          </div>

          <button
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#1B1D23] text-[#D5D7DD] lg:hidden"
            aria-label="Меню"
            type="button"
          >
            <Menu className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </header>
  );
}
