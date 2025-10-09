import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles } from 'lucide-react';

export const AuthForm = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, register } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await register(username, email, password);
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 bg-[#f7f6f3]">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 sm:p-8 border border-[#e9e9e7]">
                <div className="flex items-center justify-center mb-4 sm:mb-6">
                    <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-[#2383e2] mr-2" />
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#37352f]">BrainStorm AI</h1>
                </div>

                <h2 className="text-lg sm:text-xl font-semibold text-center text-[#37352f] mb-4 sm:mb-6">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-[#37352f] mb-1">
                                Username
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-3 sm:px-4 py-2 border border-[#e9e9e7] rounded-md text-sm sm:text-base text-[#37352f] placeholder-[#9b9a97] focus:border-[#2383e2] focus:ring-1 focus:ring-[#2383e2] outline-none transition-all"
                                required={!isLogin}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-[#37352f] mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 sm:px-4 py-2 border border-[#e9e9e7] rounded-md text-sm sm:text-base text-[#37352f] placeholder-[#9b9a97] focus:border-[#2383e2] focus:ring-1 focus:ring-[#2383e2] outline-none transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-[#37352f] mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 sm:px-4 py-2 border border-[#e9e9e7] rounded-md text-sm sm:text-base text-[#37352f] placeholder-[#9b9a97] focus:border-[#2383e2] focus:ring-1 focus:ring-[#2383e2] outline-none transition-all"
                            required
                            minLength={6}
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm border border-red-200">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#2383e2] text-white py-2.5 rounded-md text-sm sm:text-base font-semibold hover:bg-[#1a73cf] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Processing...' : isLogin ? 'Login' : 'Register'}
                    </button>
                </form>

                <div className="mt-4 sm:mt-6 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-[#2383e2] hover:text-[#1a73cf] font-medium text-xs sm:text-sm"
                    >
                        {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
                    </button>
                </div>
            </div>
        </div>
    );
};
