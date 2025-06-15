import { Link, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faHome, 
  faList, 
  faCog, 
  faHeart 
} from '@fortawesome/free-solid-svg-icons'
import './sidebar.css'

const Sidebar = () => {
  const location = useLocation()

  const menuItems = [
    { path: '/', icon: faHome, tooltip: 'Главная' },
    { path: '/playlists', icon: faList, tooltip: 'Плейлисты' },
    { path: '/favorites', icon: faHeart, tooltip: 'Понравившиеся' },
  ]

  const menuItemsBottom = [
    { path: '/settings', icon: faCog, tooltip: 'Настройки' },
  ]

  return (
    <div className="sidebar">
      <div className="sidebar-nav sidebar-nav-top">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={item.icon} />
            <span className="sidebar-tooltip">{item.tooltip}</span>
          </Link>
        ))}
      </div>
      <div className="sidebar-nav sidebar-nav-bottom">
        {menuItemsBottom.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={item.icon} />
            <span className="sidebar-tooltip">{item.tooltip}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Sidebar