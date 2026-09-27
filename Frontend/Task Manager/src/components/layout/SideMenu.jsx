import { useContext } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { UserContext } from '../../context/useContext'
import { SIDE_MENU_DATA, SIDE_MENU_USER_DATA } from '../../utils/data';
import { getImageUrl } from '../../utils/helper';
import { LuUser } from 'react-icons/lu';

const SideMenu = ({activeMenu, onNavigate}) => {
  const { user, clearUser } = useContext(UserContext);
  const location = useLocation();
  const isUserRoute = location.pathname.startsWith('/users');
  const isAdmin = !isUserRoute && String(user?.role || '').trim().toLowerCase() === 'admin';
  const sideMenuData = isAdmin ? SIDE_MENU_DATA : SIDE_MENU_USER_DATA;

  const navigate = useNavigate();

  const handleClick = (route) => {
    if(route === 'logout'){
      handleLogout();
      return;
    }

    navigate(route);
    onNavigate?.();
  };

  const handleLogout = () => {
    localStorage.clear();
    clearUser();
    navigate('/login');
    onNavigate?.();
  };

  return (
    <aside className='dashboard-sidebar'>
      <div className='dashboard-user-profile'>
        <div className='dashboard-user-avatar'>
          {user?.profileImageUrl ? (
            <img src={getImageUrl(user.profileImageUrl)} alt='Profile' />
          ) : (
            <div className='dashboard-user-placeholder'>
              <LuUser />
            </div>
          )}
        </div>

        {isAdmin && (
          <div className='dashboard-role-badge'>
            Admin
          </div>
        )} 

        <h5 className='dashboard-user-name'>
          {user?.name || ""}
        </h5>

        <p className='dashboard-user-email'>{user?.email || ""}</p>
      </div>

      <nav className='dashboard-nav' aria-label='Workspace navigation'>
        <p className='dashboard-nav-label'>Workspace</p>
        {sideMenuData.map((item) => {
          const isActive = activeMenu === item.label;
          const isLogout = item.path === 'logout';
          return (
            <button
              type="button"
              key={item.id}
              className={`dashboard-nav-item ${isActive ? 'is-active' : ''}`}
              style={isLogout ? {
                marginTop: 12,
                borderTop: '1px solid #e2e8f0',
                paddingTop: 14,
                color: '#ef4444'
              } : {}}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => handleClick(item.path)}
            >
              <item.icon />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

export default SideMenu
