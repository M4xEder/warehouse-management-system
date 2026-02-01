async function loadHeader() {
  const container = document.getElementById('header')
  if (!container) return

  const response = await fetch('components/header.html')
  const html = await response.text()
  container.innerHTML = html
}

loadHeader()
