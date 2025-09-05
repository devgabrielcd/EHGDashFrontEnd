import Signout from '@/components/auth/signout-button';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';

const DashEmployee = async () => {
    const session = await auth();

    // console.log('Log da sessao', session);
    if (!session?.user?.details) {
        return <p>Carregando detalhes do usuário...</p>;
      }
    // if (!session) {
    //     return redirect('/login');
    // }   
    return (
        <div>
            <h1>Dashboard Employee</h1>
            <p>User_Id: {session?.user?.id}</p>
            <p>Token: {session?.accessToken}</p>
            <p>Refresh Token: {session?.refreshToken}</p>
            <p>Usuário: {session?.user?.details.first_name}</p>
            <p>Email: {session?.user?.details.email}</p>
            <p>Role: {session?.user?.details.user_role}</p>
            <p>Phone: {session?.user?.details.phone_number}</p>
            <p>PhoneType: {session?.user?.details.phone_number_type}</p>
            <p>Date of Birth: {session?.user?.details.date_of_birth}</p>
            <p>Signed at: {session?.user?.details.signed_date}</p>

            <Signout /><br />
            <button><Link href='/'>Home Page</Link></button><br />
            <button><Link href='/products'>Products Page</Link></button>
            
        </div>
    );
};

export default DashEmployee;
