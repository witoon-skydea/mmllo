// Create a new board
async function createBoard(event) {
  event.preventDefault();
  
  const title = document.getElementById('board-title').value;
  const description = document.getElementById('board-description').value;
  const background = document.getElementById('board-background').value;
  
  if (!title) {
    showAlert('Please enter a board title', 'danger');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/boards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        title,
        description,
        background: background || '#0079bf'
      }),
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Redirect to the new board
      window.location.href = getUrl(`/board.html?id=${data.board.id}`);
    } else {
      showAlert(data.error || 'Failed to create board', 'danger');
    }
  } catch (error) {
    console.error('Create board error:', error);
    showAlert('Something went wrong. Please try again later.', 'danger');
  }
}