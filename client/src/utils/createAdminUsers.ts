// Admin users creation is now handled via API
export const createAdminUsers = async () => {
  try {
    const response = await fetch('/api/create-admin-users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('Error creating admin users');
      return false;
    }
    
    const data = await response.json();
    console.log('Admin users created:', data);
    return true;
  } catch (error) {
    console.error('Error invoking function:', error);
    return false;
  }
};

// Auto-create users on app load
if (typeof window !== 'undefined') {
  createAdminUsers();
}