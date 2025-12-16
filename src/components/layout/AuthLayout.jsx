import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <img src={logo} alt="MuJemea At-Tekwa" className="h-16 w-auto mx-auto mb-4" />
            <h1 className="text-2xl font-bold gradient-text">MuJemea At-Tekwa</h1>
          </Link>
        </div>
        <div className="bg-card rounded-xl shadow-card border border-border/50 p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;