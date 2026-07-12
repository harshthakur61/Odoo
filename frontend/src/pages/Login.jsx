import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    const result = await login(email, password);
    
    setIsLoading(false);
    
    if (result.success) {
      if (result.user.role === 'Driver') {
        navigate('/driver-portal', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-md bg-[#f8fafc]">
      {/* Login Container */}
      <div className="w-full max-w-[400px] flex flex-col items-center">
        
        {/* Header / Identity */}
        <div className="text-center mb-xl">
          {/* Brand Logo Representation */}
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-lg mb-md">
            <span className="material-symbols-outlined text-white text-[28px]">local_shipping</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">TransitOps</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Fleet operations platform</p>
        </div>

        {/* Login Card */}
        <div className="w-full bg-white border border-outline-variant rounded-lg p-xl">
          <form className="space-y-lg" onSubmit={handleSubmit}>
            
            {/* Email Field */}
            <div className="space-y-sm">
              <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="email">Email</label>
              <div className="relative">
                <input 
                  className="w-full h-11 px-md bg-white border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:opacity-70 disabled:bg-slate-50" 
                  id="email" 
                  name="email" 
                  placeholder="name@company.com" 
                  required 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-sm">
              <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="password">Password</label>
              <div className="relative">
                <input 
                  className="w-full h-11 px-md bg-white border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:opacity-70 disabled:bg-slate-50" 
                  id="password" 
                  name="password" 
                  placeholder="Enter password" 
                  required 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-error bg-error-container p-3 rounded border border-error/20">
                {error}
              </div>
            )}

            {/* Demo Credentials Quick-Fill */}
            <div className="pt-2">
              <p className="text-label-sm text-outline mb-2">Demo Accounts (Click to auto-fill):</p>
              <div className="flex flex-wrap gap-2">
                <button 
                  type="button" 
                  onClick={() => { setEmail('admin@transitops.com'); setPassword('demo'); }}
                  className="px-3 py-1 bg-surface-container-low border border-outline-variant rounded text-label-sm hover:bg-surface-container transition-colors"
                >
                  Fleet Manager
                </button>
                <button 
                  type="button" 
                  onClick={() => { setEmail('dispatcher@transitops.com'); setPassword('demo'); }}
                  className="px-3 py-1 bg-surface-container-low border border-outline-variant rounded text-label-sm hover:bg-surface-container transition-colors"
                >
                  Dispatcher
                </button>
                <button 
                  type="button" 
                  onClick={() => { setEmail('field@transitops.com'); setPassword('demo'); }}
                  className="px-3 py-1 bg-surface-container-low border border-outline-variant rounded text-label-sm hover:bg-surface-container transition-colors"
                >
                  Field Driver
                </button>
                <button 
                  type="button" 
                  onClick={() => { setEmail('phantomking176@gmail.com'); setPassword('demo'); }}
                  className="px-3 py-1 bg-surface-container-low border border-outline-variant rounded text-label-sm hover:bg-surface-container transition-colors"
                >
                  Akash Thakur
                </button>
                <button 
                  type="button" 
                  onClick={() => { setEmail('safety@transitops.com'); setPassword('demo'); }}
                  className="px-3 py-1 bg-surface-container-low border border-outline-variant rounded text-label-sm hover:bg-surface-container transition-colors"
                >
                  Safety Officer
                </button>
                <button 
                  type="button" 
                  onClick={() => { setEmail('finance@transitops.com'); setPassword('demo'); }}
                  className="px-3 py-1 bg-surface-container-low border border-outline-variant rounded text-label-sm hover:bg-surface-container transition-colors"
                >
                  Financial Analyst
                </button>
              </div>
            </div>

            {/* Primary Action */}
            <button 
              className="w-full h-11 bg-primary text-white font-label-md text-label-md font-bold rounded-lg transition-colors hover:bg-primary-container active:scale-[0.98] duration-200 disabled:opacity-70 disabled:cursor-not-allowed mt-4" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        {/* Visual Anchor (Subtle) */}
        <div className="mt-xl opacity-20 grayscale">
          <div className="flex items-center gap-xs">
            <div className="h-[1px] w-8 bg-outline"></div>
            <span className="font-label-sm text-label-sm text-outline">v2.4.0-stable</span>
            <div className="h-[1px] w-8 bg-outline"></div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
