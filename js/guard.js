async function protectPage() {
  const { data, error } = await supabase.auth.getSession()

  if (error || !data.session) {
    window.location.replace('login.html')
    return
  }

  // Libera a página
  document.body.style.display = 'block'
}

document.body.style.display = 'none'
protectPage()
