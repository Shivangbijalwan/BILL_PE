// Wait for Clerk to load
window.addEventListener('load', async () => {
  await window.Clerk.load();
  
  if (window.Clerk.user) {
    // Get user's name
    const userName = window.Clerk.user.firstName || 
                     window.Clerk.user.username || 
                     'User';
    
    // Display the name
    document.getElementById('user-name').textContent = userName;
    
    // Show dashboard content (if you had it hidden)
    document.getElementById('dashboard-content').classList.remove('hidden');
  }
  
  // Hide loading (if you want to keep the loader logic in JS)
  document.getElementById('loading')?.classList.add('hidden');
});

// Sign out handler
document.getElementById('signOut')?.addEventListener('click', async () => {
  await window.Clerk.signOut();
  window.location.href = '/';
});