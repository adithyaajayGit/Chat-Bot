const signupBtn = document.getElementById('signup-btn');
if (signupBtn) {
  signupBtn.addEventListener('click', async () => {
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });
      if (response.ok) {
        alert('Signup successful. You can now log in.');
        window.location.href='login.html'
        // Optionally redirect to login page
      } else {
        alert('Signup failed: ' + await response.text());
      }
    } catch (error) {
      console.error('Error signing up:', error);
    }
  });
}