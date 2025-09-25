'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Button, Popconfirm } from 'antd';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { authHeaders, apiBase } from '@/lib/apiHeaders';

function readCookie(name) {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp('(^|; )' + encodeURIComponent(name) + '=([^;]*)'));
  return m ? decodeURIComponent(m[2]) : null;
}
function clearCookie(name) {
  try {
    document.cookie = `${encodeURIComponent(name)}=; Max-Age=0; Path=/; SameSite=Lax`;
  } catch {}
}

export default function DangerZoneCard({ userId }) {
  const router = useRouter();
  const API_BASE = apiBase();

  const [resolvedId, setResolvedId] = useState(
    Number.isFinite(Number(userId)) && Number(userId) > 0 ? Number(userId) : null
  );
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  // resolve userId via /api/auth/session/ if not passed as prop
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (resolvedId) return;
        const res = await fetch(`${API_BASE}/api/auth/session/`, {
          credentials: 'include',
          headers: authHeaders(),
        });
        const data = await res.json();
        const id = Number(data?.user?.id);
        if (!alive) return;
        if (id) setResolvedId(id);
        else setStatus('Unable to identify the logged-in user.');
      } catch {
        alive && setStatus('Unable to identify the logged-in user.');
      }
    })();
    return () => { alive = false; };
  }, [API_BASE, resolvedId]);

  const effectiveUserId = useMemo(() => {
    const pid = Number(userId);
    if (Number.isFinite(pid) && pid > 0) return pid;
    return resolvedId;
  }, [userId, resolvedId]);

  const handleDelete = async () => {
    if (!effectiveUserId) return;
    setLoading(true);
    setStatus('');
    try {
      const headers = {
        ...authHeaders(),
        Accept: 'application/json',
        'X-CSRFToken': readCookie('csrftoken') || '',
      };

      // 1) Hard delete (self) in Django
      const res = await fetch(`${API_BASE}/api/users/${effectiveUserId}/`, {
        method: 'DELETE',
        credentials: 'include',
        headers,
      });

      if (res.status === 204) {
        // 2) End Django session and clear JWT
        try {
          await fetch(`${API_BASE}/api/auth/logout/`, {
            method: 'POST',
            credentials: 'include',
            headers: { ...authHeaders(), 'X-CSRFToken': readCookie('csrftoken') || '' },
          });
        } catch {}
        clearCookie('dj_access');

        // 3) End NextAuth session and redirect to home
        await signOut({ callbackUrl: '/', redirect: true });
        return;
      }

      const data = await res.json().catch(() => ({}));
      setStatus(data?.detail || 'Failed to delete the account.');
    } catch {
      setStatus('Error while deleting the account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ant-card ant-card-bordered">
      <div className="ant-card-head"><div className="ant-card-head-title">Danger Zone</div></div>
      <div className="ant-card-body">
        {!effectiveUserId ? (
          <div>{status || 'Identifying user…'}</div>
        ) : (
          <>
            <Popconfirm
              title="Delete account?"
              description="This action is irreversible and will remove all your data."
              okText="Yes, delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true, loading }}
              onConfirm={handleDelete}
            >
              <Button danger loading={loading}>Delete Account</Button>
            </Popconfirm>
            <div style={{ marginTop: 8, minHeight: 20 }}>{status}</div>
          </>
        )}
      </div>
    </div>
  );
}
