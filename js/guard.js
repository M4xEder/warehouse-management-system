// Esconde a página até validar login
document.body.style.display = 'none'

supabase.auth.onAuthStateChange((event, session) => {
  if (!session) {
    window.location.replace('login.html')
  } else {
    document.body.style.display = 'block'
  }
})
