import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', icon: 'home', label: 'Home' },
  { to: '/schedule', icon: 'calendar_month', label: 'Schedule' },
  { to: '/sleep', icon: 'bedtime', label: 'Sleep' },
  { to: '/chat', icon: 'chat_bubble', label: 'Chat' },
  { to: '/settings', icon: 'person', label: 'Me' },
];

export function Navigation() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-[#F5F2E8] px-8 py-4 pb-8 flex justify-between items-center z-50">
      {navItems.map(({ to, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 transition-colors ${
              isActive ? 'text-[#f0426e]' : 'text-[#89616b]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span 
                className="material-symbols-outlined"
                style={{ 
                  fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                  color: isActive ? '#f0426e' : '#89616b'
                }}
              >
                {icon}
              </span>
              <span className="text-[10px] font-bold">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
