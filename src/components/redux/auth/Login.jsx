
'use client'
import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

const Login = () => {
    const userRef = useRef();
    const errRef = useRef();
    const [user, setUser] = useState('');
    const [pwd, setPwd] = useState('');
    const [errMsg, setErrMsg] = useState('');
    const router = useRouter();

    useEffect(() => {
        userRef.current.focus();
    }, []);

    useEffect(() => {
        setErrMsg('');
    }, [user, pwd]);

    useEffect(() => {
        if (errRef.current && errMsg) {
            errRef.current.focus();
        }
    }, [errMsg]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const result = await signIn('credentials', {
            redirect: false,
            username: user,
            password: pwd,
        });

        if (result.ok) {
            setUser('');
            setPwd('');
            router.push('/dashboard'); // Redireciona após login bem-sucedido
        } else {
            setErrMsg('Login Failed');
        }
    };

    const handleUserInput = (e) => setUser(e.target.value);
    const handlePwdInput = (e) => setPwd(e.target.value);

    return (
        <section className="login">
            <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>

            <h1>Employee Login</h1>

            <form onSubmit={handleSubmit}>
                <label htmlFor="username">Username:</label>
                <input
                    type="text"
                    id="username"
                    ref={userRef}
                    value={user}
                    onChange={handleUserInput}
                    autoComplete="off"
                    required
                />

                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    onChange={handlePwdInput}
                    value={pwd}
                    required
                />
                <button>Sign In</button>
            </form>
        </section>
    );
};

export default Login;
