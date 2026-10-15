// Fake Supabase for tests.
//   window.__TU        = { id, email } → already logged in (saved session)
//   window.__TU_LOGIN  = { id, email } → logged out; signInWithPassword logs this user in
//   rpc() is answered by the Python "server" (window.__rpc)
//   auth calls are recorded in window.__auth for the tests to inspect
window.__auth = [];
window.supabase = { createClient(){
  const mk = u => u ? { user:{ id:u.id, email:u.email, user_metadata:{ tv_experience_level:'intermediate' } } } : null;
  let user = window.__TU || null, session = mk(user);
  const subs = [];
  const recovery = /type=recovery/.test(location.hash);
  const q = { select:()=>q, insert:()=>q, update:()=>q, upsert:()=>q, delete:()=>q, eq:()=>q, order:()=>q, limit:()=>q, single:()=>q,
              then:(res)=>Promise.resolve({ data:[], error:null }).then(res) };
  if(recovery && session) setTimeout(() => subs.forEach(cb => cb('PASSWORD_RECOVERY', session)), 30);
  return {
    auth:{
      getSession: async()=>({ data:{ session } }),
      onAuthStateChange: cb => { subs.push(cb); return { data:{ subscription:{ unsubscribe(){} } } }; },
      signOut: async()=>{ session = null; user = null; return { error:null }; },
      signInWithPassword: async(a)=>{ window.__auth.push(['signIn', a.email]);
        if(!window.__TU_LOGIN) return { data:{}, error:{ message:'Invalid login credentials' } };
        user = window.__TU_LOGIN; session = mk(user); setTimeout(() => subs.forEach(cb => cb('SIGNED_IN', session)), 0);
        return { data:{ session }, error:null }; },
      signUp: async(a)=>{ window.__auth.push(['signUp', a.email, a.options && a.options.emailRedirectTo]); return { data:{}, error:null }; },
      resetPasswordForEmail: async(email, o)=>{ window.__auth.push(['reset', email, o && o.redirectTo]); return { data:{}, error:null }; },
      updateUser: async(a)=>{ window.__auth.push(['update', a.password ? 'pw:' + a.password.length : 'meta']); return { data:{}, error:null }; }
    },
    from:()=>q,
    rpc: async (name, args) => JSON.parse(await window.__rpc(name, JSON.stringify(args || {}), user ? user.id : ''))
  };
}};
