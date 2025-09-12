'use client';

import React, { useState, useEffect } from 'react';
import { Spin } from 'antd';
import { useSession } from 'next-auth/react';

/**
 * Props:
 * - waitAuth: se true, só libera quando a sessão estiver 'authenticated' e houver accessToken
 * - minDelay: atraso mínimo (ms) pra evitar flicker (padrão 300ms; passe 0 para desativar)
 */
export default function Loader({ children, waitAuth = false, minDelay = 300 }) {
  const [windowReady, setWindowReady] = useState(false);
  const [delayDone, setDelayDone] = useState(!minDelay);

  const { data: session, status } = useSession();
  const authReady = !waitAuth || (status === 'authenticated' && !!session?.accessToken);

  useEffect(() => {
    const handleLoad = () => setWindowReady(true);
    if (document.readyState === 'complete') handleLoad();
    else window.addEventListener('load', handleLoad);
    return () => window.removeEventListener('load', handleLoad);
  }, []);

  useEffect(() => {
    if (!minDelay) return;
    const t = setTimeout(() => setDelayDone(true), minDelay);
    return () => clearTimeout(t);
  }, [minDelay]);

  const loading = !(windowReady && delayDone && authReady);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return <>{children}</>;
}
