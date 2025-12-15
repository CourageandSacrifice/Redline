'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function TestDB() {
  const [status, setStatus] = useState('Checking...');
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<any>({});

  useEffect(() => {
    async function test() {
      const supabase = createClient();
      const testDetails: any = {};
      
      // Test 1: Check if we can connect
      try {
        const { data, error } = await supabase.from('users').select('count').limit(1);
        if (error) {
          setError(`DB Error: ${error.message}`);
          setStatus('❌ Database connection failed');
          testDetails.dbError = error;
        } else {
          setStatus('✅ Database connected!');
          testDetails.dbConnected = true;
        }
      } catch (e: any) {
        setError(e.message);
        setStatus('❌ Connection error');
        testDetails.connectionError = e.message;
      }

      // Test 2: Check auth
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      testDetails.user = user;

      // Test 3: Check tables
      const tables = ['users', 'channels', 'collections', 'clips', 'car_info', 'performance_stats'];
      testDetails.tables = {};
      
      for (const table of tables) {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
        testDetails.tables[table] = error ? `❌ ${error.message}` : `✅ ${count} rows`;
      }

      setDetails(testDetails);
    }
    test();
  }, []);

  return (
    <div style={{ padding: 40, fontFamily: 'monospace', background: '#15202b', color: '#e7e9ea', minHeight: '100vh' }}>
      <h1 style={{ color: '#dc2626' }}>🏎️ Redline Database Test</h1>
      
      <div style={{ background: '#192734', padding: 20, borderRadius: 12, marginBottom: 20 }}>
        <h2>Connection Status</h2>
        <p style={{ fontSize: 24 }}>{status}</p>
        {error && <p style={{ color: '#dc2626' }}><strong>Error:</strong> {error}</p>}
      </div>

      <div style={{ background: '#192734', padding: 20, borderRadius: 12, marginBottom: 20 }}>
        <h2>Environment Variables</h2>
        <p><strong>SUPABASE_URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ NOT SET'}</p>
        <p><strong>ANON_KEY:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set (hidden for security)' : '❌ NOT SET'}</p>
      </div>

      <div style={{ background: '#192734', padding: 20, borderRadius: 12, marginBottom: 20 }}>
        <h2>Authentication</h2>
        <p><strong>Logged in as:</strong> {user ? user.email : '❌ Not logged in'}</p>
        {user && <p><strong>User ID:</strong> {user.id}</p>}
      </div>

      <div style={{ background: '#192734', padding: 20, borderRadius: 12, marginBottom: 20 }}>
        <h2>Tables</h2>
        {details.tables && Object.entries(details.tables).map(([table, status]) => (
          <p key={table}><strong>{table}:</strong> {status as string}</p>
        ))}
      </div>

      <div style={{ background: '#192734', padding: 20, borderRadius: 12 }}>
        <h2>Quick Links</h2>
        <p><a href="/auth/login" style={{ color: '#dc2626' }}>→ Go to Login</a></p>
        <p><a href="/dashboard" style={{ color: '#dc2626' }}>→ Go to Dashboard</a></p>
        <p><a href="/dashboard/upload" style={{ color: '#dc2626' }}>→ Go to Upload</a></p>
      </div>
    </div>
  );
}
