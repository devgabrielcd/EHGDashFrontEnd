import Signout from '@/components/auth/signout-button';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';

const Welcome = async () => {
    const session = await auth();

    // console.log('Log da sessao', session);

    // if (status === 'loading') {
    //     return <p>Carregando sessão...</p>;
    // }
    if (!session) {
        return redirect('/login');
    } else {
        const user = session.user;

    return (
        <div>
            <h1>Welcome Customer!</h1>
            <p>Token: {session?.accessToken}</p>
            <p>Refresh Token: {session?.refreshToken}</p>
            <p>User Type: {user.details.user_type}</p>
            <p>User Role: {user.details.user_role}</p>
            <p>Full Name: {user.details.first_name} {user.details.last_name}</p>
            <p>Email: {user.details.email}</p>
            <p>Phone: {user.details.phone_number}</p>
            <Signout /><br />
            <button><Link href='/'>Home Page</Link></button><br />
            <button><Link href='/products'>Products Page</Link></button>
            
        </div>
    );
    }
};

export default Welcome;
