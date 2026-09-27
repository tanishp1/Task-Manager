import { FiCheck } from 'react-icons/fi'

const Authlayout = ({children, variant}) => {
  const isLogin = variant === 'login'
  const isSignup = variant === 'signup'
  const isBranded = isLogin || isSignup

  return (
    <div className={isLogin ? 'auth-login-shell' : isSignup ? 'auth-signup-shell' : 'flex'}>
      <div className={isLogin ? 'auth-login-panel' : isSignup ? 'auth-signup-panel' : 'w-screen h-screen md:w-[60vw] px-12 pt-8 pb-12'}>
        <h2 className={isBranded ? 'auth-login-brand' : 'text-lg font-medium text-black'}>
          {isBranded && <span className="auth-login-brand-mark" aria-hidden="true"><FiCheck /></span>}
          Task Manager
        </h2>
        {isLogin ? <main className="auth-login-main">{children}</main> : isSignup ? <main className="auth-signup-main">{children}</main> : children}
      </div>

      {!isBranded && <div className="hidden md:flex w-[40vw] h-screen items-center justify-center bg-blue-50 bg-cover bg-no-repeat bg-center overflow-hidden" />}
    </div>
  )
}

export default Authlayout
