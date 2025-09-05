'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '@/features/products/productsSlice';
import { useSession } from 'next-auth/react';
import ReduxProvider from "@/components/redux/reduxProvider";
import SessionWrapper from '@/components/auth/sessionProvider';
import { useRouter } from 'next/navigation';

const ProductsPage = () => {
    const dispatch = useDispatch();
    const { products, status, error } = useSelector((state) => state.products);
    const { data: session, status: sessionStatus } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (sessionStatus === "unauthenticated") {
            router.push('/login'); // Redireciona para login se o usuário não estiver autenticado
        }
    }, [sessionStatus, router]);

    useEffect(() => {
        if (session?.accessToken && status === 'idle') {
            dispatch(fetchProducts(session.accessToken));
        }
    }, [session, status, dispatch]);

    if (sessionStatus === 'loading') return <p>Carregando sessão...</p>;
    if (status === 'loading') return <p>Carregando produtos...</p>;
    if (status === 'failed') return <p>Erro: {error}</p>;

    return (
        <div>
            <h1>Lista de Produtos</h1>
            <ul>
                {products.map((product) => (
                    <li key={product.id}>
                        <h2>{product.name}</h2>
                        <p>{product.description}</p>
                        <p>{product.price}</p>
                        <p>Sold by: {product.employee_id}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

// Envelopa a página em ReduxProvider e SessionWrapper para gerenciar o estado do Redux e a sessão apenas nesta página
const ProductsPageWithProvider = () => (
    <ReduxProvider>
        <SessionWrapper>
            <ProductsPage />
        </SessionWrapper>
    </ReduxProvider>
);

export default ProductsPageWithProvider;
