import { AuthContext, useAuthProvider } from '@/hooks/useAuth';

const AuthProvider = ({ children }) => {
  const auth = useAuthProvider();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
