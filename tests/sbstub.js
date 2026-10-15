// Fake Supabase for tests: session from window.__TU, rpc → Python "server"
window.supabase = { createClient(){
  const u = window.__TU || null;
  const session = u ? { user:{ id:u.id, email:u.email, user_metadata:{ tv_experience_level:'intermediate' } } } : null;
  const q = { select:()=>q, insert:()=>q, update:()=>q, upsert:()=>q, delete:()=>q, eq:()=>q, order:()=>q, limit:()=>q, single:()=>q,
              then:(res)=>Promise.resolve({ data:[], error:null }).then(res) };
  return {
    auth:{ getSession: async()=>({ data:{ session } }), onAuthStateChange:()=>({ data:{ subscription:{ unsubscribe(){} } } }),
           signOut: async()=>({ error:null }), signInWithPassword: async()=>({ data:{}, error:null }),
           signUp: async()=>({ data:{}, error:null }), updateUser: async()=>({ data:{}, error:null }) },
    from:()=>q,
    rpc: async (name, args) => JSON.parse(await window.__rpc(name, JSON.stringify(args || {}), u ? u.id : ''))
  };
}};
