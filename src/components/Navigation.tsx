import { NavLink } from 'react-router-dom';
import { CheckSquare, Calendar, Moon, Settings, MessageCircle } from 'lucide-react';

const navItems = [
  { to: '/', icon: CheckSquare, label: '任务' },
  { to: '/schedule', icon: Calendar, label: '安排' },
  { to: '/sleep', icon: Moon, label: '睡眠' },
  { to: '/chat', icon: MessageCircle, label: 'AI' },
  { to: '/settings', icon: Settings, label: '设置' },
];

export function Navigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors ${
                isActive 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-gray-500 hover:text-gray-700'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs mt-1">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
