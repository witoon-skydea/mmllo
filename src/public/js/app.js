// App configuration
const getBasePath = () => {
  const pathSegments = window.location.pathname.split('/');
  if (pathSegments.length >= 2 && pathSegments[1] === 'mmllo') {
    return '/mmllo';
  }
  return '';
};

const BASE_PATH = getBasePath();
const API_URL = `${BASE_PATH}/api`;

// Utility function to get URL with base path
const getUrl = (path) => {
  return `${BASE_PATH}${path}`;
};

// Show alert message
function showAlert(message, type = 'info') {
  const alertsContainer = document.getElementById('alerts-container');
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.innerText = message;
  
  // Add close button
  const closeButton = document.createElement('span');
  closeButton.className = 'alert-close';
  closeButton.innerHTML = '&times;';
  closeButton.onclick = function() {
    alertsContainer.removeChild(alertDiv);
  };
  alertDiv.appendChild(closeButton);
  
  alertsContainer.appendChild(alertDiv);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (alertDiv.parentNode === alertsContainer) {
      alertsContainer.removeChild(alertDiv);
    }
  }, 5000);
}

// Check if user is logged in
function isLoggedIn() {
  return localStorage.getItem('token') !== null;
}

// Update navigation based on login status
function updateNavigation() {
  const navbarRight = document.getElementById('navbar-right');
  if (!navbarRight) return;
  
  navbarRight.innerHTML = '';
  
  if (isLoggedIn()) {
    const username = localStorage.getItem('username');
    
    const boardsLink = document.createElement('li');
    boardsLink.innerHTML = `<a href="${getUrl('/boards.html')}">Boards</a>`;
    
    const profileLink = document.createElement('li');
    profileLink.innerHTML = `<a href="#" class="user-profile">${username}</a>`;
    
    const logoutLink = document.createElement('li');
    logoutLink.innerHTML = '<a href="#" id="logout-link">Logout</a>';
    
    navbarRight.appendChild(boardsLink);
    navbarRight.appendChild(profileLink);
    navbarRight.appendChild(logoutLink);
    
    document.getElementById('logout-link').addEventListener('click', logout);
  } else {
    const loginLink = document.createElement('li');
    const registerLink = document.createElement('li');
    
    // Add active class to current page link
    const path = window.location.pathname;
    loginLink.innerHTML = `<a href="${getUrl('/login.html')}" ${path.endsWith('login.html') ? 'class="active"' : ''}>Login</a>`;
    registerLink.innerHTML = `<a href="${getUrl('/register.html')}" ${path.endsWith('register.html') ? 'class="active"' : ''}>Register</a>`;
    
    navbarRight.appendChild(loginLink);
    navbarRight.appendChild(registerLink);
  }
  
  // Update home link
  const homeLink = document.getElementById('homeLink');
  if (homeLink) {
    homeLink.href = getUrl('/');
  }
}

// Register a new user
async function register(event) {
  event.preventDefault();
  
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  if (!username || !email || !password) {
    showAlert('Please fill in all fields', 'danger');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        email,
        password
      }),
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('username', data.user.username);
      
      showAlert('Registration successful! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = getUrl('/boards.html');
      }, 1500);
    } else {
      showAlert(data.error || 'Registration failed', 'danger');
    }
  } catch (error) {
    console.error('Registration error:', error);
    showAlert('Something went wrong. Please try again later.', 'danger');
  }
}

// Login a user
async function login(event) {
  event.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  if (!username || !password) {
    showAlert('Please fill in all fields', 'danger');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password
      }),
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('username', data.user.username);
      
      showAlert('Login successful! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = getUrl('/boards.html');
      }, 1500);
    } else {
      showAlert(data.error || 'Login failed', 'danger');
    }
  } catch (error) {
    console.error('Login error:', error);
    showAlert('Something went wrong. Please try again later.', 'danger');
  }
}

// Logout a user
async function logout(event) {
  if (event) event.preventDefault();
  
  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include'
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
  
  // Clear local storage regardless of the logout API result
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('username');
  
  showAlert('You have been logged out', 'info');
  setTimeout(() => {
    window.location.href = getUrl('/');
  }, 1500);
}

// Get all boards for current user
async function getBoards() {
  try {
    const response = await fetch(`${API_URL}/boards`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.boards;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get boards');
    }
  } catch (error) {
    console.error('Get boards error:', error);
    showAlert('Error fetching boards: ' + error.message, 'danger');
    return [];
  }
}

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

// Get a specific board with lists and cards
async function getBoard(boardId) {
  try {
    const response = await fetch(`${API_URL}/boards/${boardId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.board;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get board');
    }
  } catch (error) {
    console.error('Get board error:', error);
    showAlert('Error fetching board: ' + error.message, 'danger');
    return null;
  }
}

// Event listeners setup
document.addEventListener('DOMContentLoaded', function() {
  // Update navigation
  updateNavigation();
  
  // Register form
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', register);
  }
  
  // Login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', login);
  }
  
  // Create board form
  const createBoardForm = document.getElementById('create-board-form');
  if (createBoardForm) {
    createBoardForm.addEventListener('submit', createBoard);
  }
  
  // Boards page
  if (window.location.pathname.endsWith('/boards.html') || window.location.pathname.endsWith('/mmllo/boards.html')) {
    if (!isLoggedIn()) {
      window.location.href = getUrl('/login.html');
      return;
    }
    
    // Load boards
    initBoardsPage();
  }
  
  // Board detail page
  if (window.location.pathname.endsWith('/board.html') || window.location.pathname.endsWith('/mmllo/board.html')) {
    if (!isLoggedIn()) {
      window.location.href = getUrl('/login.html');
      return;
    }
    
    // Get board ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const boardId = urlParams.get('id');
    
    if (boardId) {
      // Load board
      initBoardPage(boardId);
    } else {
      showAlert('Board ID is missing', 'danger');
    }
  }
});

// Initialize boards page
async function initBoardsPage() {
  const boardsContainer = document.getElementById('boards-container');
  if (!boardsContainer) return;
  
  const boards = await getBoards();
  
  if (boards.length === 0) {
    boardsContainer.innerHTML = '<div class="no-boards">You don\'t have any boards yet. Create your first board!</div>';
  } else {
    let starredHtml = '';
    let regularHtml = '';
    
    boards.forEach(board => {
      const boardHtml = `
        <div class="board-card" style="background-color: ${board.background || '#0079bf'}">
          <a href="${getUrl('/board.html?id=' + board.id)}" class="board-link">
            <h3>${board.title}</h3>
          </a>
          <div class="board-actions">
            <button class="star-btn ${board.is_starred ? 'starred' : ''}" data-id="${board.id}">
              <i class="star-icon"></i>
            </button>
          </div>
        </div>
      `;
      
      if (board.is_starred) {
        starredHtml += boardHtml;
      } else {
        regularHtml += boardHtml;
      }
    });
    
    let html = '';
    
    if (starredHtml) {
      html += `
        <div class="boards-section">
          <h2>Starred Boards</h2>
          <div class="board-cards">
            ${starredHtml}
          </div>
        </div>
      `;
    }
    
    html += `
      <div class="boards-section">
        <h2>All Boards</h2>
        <div class="board-cards">
          ${regularHtml}
        </div>
      </div>
    `;
    
    boardsContainer.innerHTML = html;
    
    // Add event listeners for star buttons
    document.querySelectorAll('.star-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const boardId = btn.dataset.id;
        const isStarred = btn.classList.contains('starred');
        
        try {
          const response = await fetch(`${API_URL}/boards/${boardId}/star`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              is_starred: !isStarred
            }),
            credentials: 'include'
          });
          
          if (response.ok) {
            // Toggle star locally
            btn.classList.toggle('starred');
            
            // Refresh the page to update the boards list
            setTimeout(() => {
              window.location.reload();
            }, 300);
          } else {
            const errorData = await response.json();
            showAlert(errorData.error || 'Failed to update star status', 'danger');
          }
        } catch (error) {
          console.error('Star board error:', error);
          showAlert('Something went wrong. Please try again later.', 'danger');
        }
      });
    });
  }
}

// Initialize board detail page
async function initBoardPage(boardId) {
  const boardContainer = document.getElementById('board-container');
  if (!boardContainer) return;
  
  const board = await getBoard(boardId);
  
  if (!board) {
    boardContainer.innerHTML = '<div class="not-found">Board not found or you don\'t have access.</div>';
    return;
  }
  
  // Set page title
  document.title = `${board.title} | MMLLO`;
  
  // Set board header
  const boardHeader = document.querySelector('.board-header');
  if (boardHeader) {
    boardHeader.innerHTML = `
      <h1>${board.title}</h1>
      <div class="board-actions">
        <button class="star-btn ${board.is_starred ? 'starred' : ''}" id="star-board">
          <i class="star-icon"></i>
        </button>
      </div>
    `;
    
    // Add event listener for star button
    document.getElementById('star-board').addEventListener('click', async () => {
      const isStarred = board.is_starred;
      
      try {
        const response = await fetch(`${API_URL}/boards/${boardId}/star`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            is_starred: !isStarred
          }),
          credentials: 'include'
        });
        
        if (response.ok) {
          // Toggle star locally
          board.is_starred = !isStarred;
          document.getElementById('star-board').classList.toggle('starred');
        } else {
          const errorData = await response.json();
          showAlert(errorData.error || 'Failed to update star status', 'danger');
        }
      } catch (error) {
        console.error('Star board error:', error);
        showAlert('Something went wrong. Please try again later.', 'danger');
      }
    });
  }
  
  // Set board background color
  document.body.style.backgroundColor = board.background || '#0079bf';
  
  // Check if we need to initialize the board
  if (board.lists && board.lists.length > 0) {
    renderLists(board.lists);
  } else {
    await initNewBoard(boardId);
  }
}

// Initialize a new board with default lists
async function initNewBoard(boardId) {
  try {
    // Create default lists (To Do, In Progress, Done)
    const defaultLists = [
      { title: 'To Do', position: 0 },
      { title: 'In Progress', position: 1 },
      { title: 'Done', position: 2 }
    ];
    
    for (const list of defaultLists) {
      await fetch(`${API_URL}/lists/board/${boardId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(list),
        credentials: 'include'
      });
    }
    
    // Reload the board to get the lists
    const response = await fetch(`${API_URL}/boards/${boardId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      renderLists(data.board.lists);
    } else {
      const errorData = await response.json();
      showAlert(errorData.error || 'Failed to initialize board', 'danger');
    }
  } catch (error) {
    console.error('Initialize board error:', error);
    showAlert('Something went wrong. Please try again later.', 'danger');
  }
}

// Render the lists for a board
function renderLists(lists) {
  const boardContent = document.getElementById('board-content');
  if (!boardContent) return;
  
  let html = '';
  
  lists.forEach(list => {
    html += `
      <div class="list" data-id="${list.id}">
        <div class="list-header">
          <h3>${list.title}</h3>
          <div class="list-actions">
            <button class="edit-list-btn" data-id="${list.id}">
              <i class="edit-icon"></i>
            </button>
          </div>
        </div>
        <div class="cards-container" data-list-id="${list.id}">
          ${renderCards(list.cards)}
        </div>
        <div class="add-card">
          <button class="add-card-btn" data-list-id="${list.id}">+ Add a card</button>
        </div>
      </div>
    `;
  });
  
  html += `
    <div class="list add-list">
      <button class="add-list-btn">+ Add another list</button>
    </div>
  `;
  
  boardContent.innerHTML = html;
  
  // Add event listeners
  setupListEventListeners();
}

// Render cards for a list
function renderCards(cards = []) {
  if (!cards || cards.length === 0) return '';
  
  let html = '';
  
  cards.forEach(card => {
    html += `
      <div class="card" data-id="${card.id}">
        <div class="card-title">${card.title}</div>
        ${card.labels && card.labels.length > 0 ? renderLabels(card.labels) : ''}
      </div>
    `;
  });
  
  return html;
}

// Render labels for a card
function renderLabels(labels) {
  if (!labels || labels.length === 0) return '';
  
  try {
    // If labels is a string (JSON), parse it
    const labelsArray = typeof labels === 'string' ? JSON.parse(labels) : labels;
    
    let html = '<div class="card-labels">';
    
    labelsArray.forEach(label => {
      html += `<span class="label" style="background-color: ${label}"></span>`;
    });
    
    html += '</div>';
    return html;
  } catch (error) {
    console.error('Error rendering labels:', error);
    return '';
  }
}

// Setup event listeners for lists and cards
function setupListEventListeners() {
  // Add list button
  const addListBtn = document.querySelector('.add-list-btn');
  if (addListBtn) {
    addListBtn.addEventListener('click', () => {
      // TODO: Implement add list functionality
      showAlert('Add list functionality coming soon!', 'info');
    });
  }
  
  // Add card buttons
  document.querySelectorAll('.add-card-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // TODO: Implement add card functionality
      showAlert('Add card functionality coming soon!', 'info');
    });
  });
  
  // Edit list buttons
  document.querySelectorAll('.edit-list-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // TODO: Implement edit list functionality
      showAlert('Edit list functionality coming soon!', 'info');
    });
  });
  
  // Card click events
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
      // TODO: Implement card detail view
      showAlert('Card detail view coming soon!', 'info');
    });
  });
}
