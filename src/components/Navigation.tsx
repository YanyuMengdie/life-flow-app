import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', icon: 'home', label: '首页' },
  { to: '/schedule', icon: 'calendar_month', label: '安排' },
  { to: '/sleep', icon: 'bedtime', label: '睡眠' },
  { to: '/chat', icon: 'chat_bubble', label: '聊天' },
  { to: '/settings', icon: 'person', label: '我的' },
];

export function Navigation() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-[#F5F2E8] px-6 py-3 pb-8 flex justify-between items-center z-50">
      {navItems.map(({ to, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 transition-colors min-w-[50px] ${
              isActive ? 'text-[#f0426e]' : 'text-[#89616b]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span 
                className="material-symbols-outlined text-2xl"
                style={{ 
                  fontVariationSettings: isActive ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 400"
                }}
              >
                {icon}
              </span>
              <span className="text-[10px] font-medium">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
