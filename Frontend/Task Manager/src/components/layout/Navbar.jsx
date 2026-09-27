import { useState, useContext } from 'react'
import { HiOutlineX, HiOutlineMenu } from 'react-icons/hi';
import { FiCheck } from 'react-icons/fi';
import { LuUser } from 'react-icons/lu';
import SideMenu from './SideMenu'
import { UserContext } from '../../context/useContext';
import { getImageUrl } from '../../utils/helper';

const Navbar = ({activeMenu}) => {
    const [openSideMenu, setOpenSideMenu] = useState(false);
    const { user } = useContext(UserContext);

  return (
        <header className='dashboard-topbar'>
            <div className='dashboard-topbar-inner'>
                <button
                    type='button'
                    className='dashboard-menu-toggle'
                    aria-label={openSideMenu ? 'Close navigation' : 'Open navigation'}
                    aria-expanded={openSideMenu}
                    onClick={() => setOpenSideMenu(!openSideMenu)}
                >
                    {openSideMenu ? <HiOutlineX /> : <HiOutlineMenu />}
                </button>

                <div className='dashboard-wordmark'>
                    <span className='dashboard-brand-mark' aria-hidden='true'><FiCheck /></span>
                    <span>Task Manager</span>
                </div>

                <span className='dashboard-topbar-section'>{activeMenu}</span>

                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {user && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: '50%',
                                overflow: 'hidden', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', background: '#e8f1ff',
                                border: '2px solid #dbeafe', flexShrink: 0
                            }}>
                                {user.profileImageUrl
                                    ? <img src={getImageUrl(user.profileImageUrl)} alt='' style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    : <LuUser style={{ color: '#1368ec', width: 16, height: 16 }} />
                                }
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 500, color: '#334155', display: 'none' }}
                                className='sm:block'>
                                {user.name?.split(' ')[0]}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {openSideMenu && (
                <div className='dashboard-mobile-nav'>
                    <button
                        type='button'
                        className='dashboard-mobile-backdrop'
                        aria-label='Close navigation'
                        onClick={() => setOpenSideMenu(false)}
                    />
                    <div className='dashboard-mobile-panel'>
                        <SideMenu activeMenu={activeMenu} onNavigate={() => setOpenSideMenu(false)}/>
                    </div>
                </div>
            )}
        </header>
  )
}

export default Navbar
