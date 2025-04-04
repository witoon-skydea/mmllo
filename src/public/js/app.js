// Global state
const state = {
  user: null,
  boards: [],
  currentBoard: null,
  lists: [],
  cards: [],
  dragging: null
};

// API Base URL
const API_URL = '/api';

// DOM Elements
const boardsContainer = document.getElementById('boards-container');
const boardView = document.getElementById('board-view');
const listsContainer = document.getElementById('lists-container');
const navbarRight = document.getElementById('navbar-right');
const modalOverlay = document.getElementById('modal-overlay');
const cardDetailModal = document.getElementById('card-detail-modal');

// Check if user is logged in
async function checkAuth() {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      state.user = data.user;
      updateNavbar();
      return true;
    } else {
      state.user = null;
      updateNavbar();
      window.location.href = '/login.html';
      return false;
    }
  } catch (error) {
    console.error('Auth check error:', error);
    state.user = null;
    updateNavbar();
    return false;
  }
}

// Update navbar based on auth state
function updateNavbar() {
  if (navbarRight) {
    if (state.user) {
      navbarRight.innerHTML = `
        <li><a href="/boards.html">Boards</a></li>
        <li><a href="#" id="logout-link">Logout</a></li>
        <li><span class="user-welcome">Welcome, ${state.user.username}</span></li>
      `;
      document.getElementById('logout-link').addEventListener('click', logout);
    } else {
      navbarRight.innerHTML = `
        <li><a href="/login.html">Login</a></li>
        <li><a href="/register.html">Register</a></li>
      `;
    }
  }
}

// Register a new user
async function register(event) {
  event.preventDefault();
  
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  
  // Form validation
  if (!username || !email || !password) {
    showAlert('Please enter all fields', 'danger');
    return;
  }
  
  if (password !== confirmPassword) {
    showAlert('Passwords do not match', 'danger');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email, password }),
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showAlert('Registration successful! Redirecting to login...', 'success');
      setTimeout(() => {
        window.location.href = '/login.html';
      }, 2000);
    } else {
      showAlert(data.error || 'Registration failed', 'danger');
    }
  } catch (error) {
    console.error('Registration error:', error);
    showAlert('Something went wrong. Please try again later.', 'danger');
  }
}

// Login user
async function login(event) {
  event.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  // Form validation
  if (!username || !password) {
    showAlert('Please enter both username and password', 'danger');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password }),
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('token', data.token);
      window.location.href = '/boards.html';
    } else {
      showAlert(data.error || 'Login failed', 'danger');
    }
  } catch (error) {
    console.error('Login error:', error);
    showAlert('Something went wrong. Please try again later.', 'danger');
  }
}

// Logout user
async function logout(event) {
  if (event) event.preventDefault();
  
  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    
    localStorage.removeItem('token');
    state.user = null;
    window.location.href = '/login.html';
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// Fetch user's boards
async function fetchBoards() {
  try {
    const response = await fetch(`${API_URL}/boards`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      state.boards = data.boards;
      renderBoards();
    } else if (response.status === 401) {
      // Unauthorized, redirect to login
      window.location.href = '/login.html';
    } else {
      showAlert('Failed to fetch boards', 'danger');
    }
  } catch (error) {
    console.error('Fetch boards error:', error);
    showAlert('Something went wrong. Please try again later.', 'danger');
  }
}

// Render boards in boards container
function renderBoards() {
  if (!boardsContainer) return;
  
  boardsContainer.innerHTML = '';
  
  if (state.boards.length === 0) {
    boardsContainer.innerHTML = '<p>You have no boards yet. Create your first board!</p>';
    return;
  }
  
  state.boards.forEach(board => {
    const boardCard = document.createElement('div');
    boardCard.className = 'board-card';
    boardCard.style.backgroundColor = board.background || '#0079bf';
    
    const starIcon = board.is_starred ? '★' : '☆';
    
    boardCard.innerHTML = `
      <div class="board-card-title">${board.title}</div>
      <div class="board-card-footer">
        <span>${new Date(board.created_at).toLocaleDateString()}</span>
        <span class="star-icon" data-id="${board.id}" data-starred="${board.is_starred}">${starIcon}</span>
      </div>
    `;
    
    boardCard.addEventListener('click', (e) => {
      // Don't navigate if clicking on the star icon
      if (e.target.classList.contains('star-icon')) {
        e.preventDefault();
        e.stopPropagation();
        toggleBoardStar(e.target.dataset.id, e.target.dataset.starred === 'true' ? false : true);
        return;
      }
      
      window.location.href = `/board.html?id=${board.id}`;
    });
    
    boardsContainer.appendChild(boardCard);
  });
  
  // Add "Create New Board" card
  const newBoardCard = document.createElement('div');
  newBoardCard.className = 'board-card';
  newBoardCard.style.backgroundColor = '#e2e4e6';
  newBoardCard.style.color = '#172b4d';
  newBoardCard.style.display = 'flex';
  newBoardCard.style.justifyContent = 'center';
  newBoardCard.style.alignItems = 'center';
  
  newBoardCard.innerHTML = '<div class="board-card-title">+ Create New Board</div>';
  
  newBoardCard.addEventListener('click', () => {
    // Show create board modal or redirect to create board page
    showCreateBoardModal();
  });
  
  boardsContainer.appendChild(newBoardCard);
}

// Toggle board star status
async function toggleBoardStar(boardId, isStarred) {
  try {
    const response = await fetch(`${API_URL}/boards/${boardId}/star`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ is_starred: isStarred }),
      credentials: 'include'
    });
    
    if (response.ok) {
      // Update local state
      state.boards = state.boards.map(board => {
        if (board.id === parseInt(boardId)) {
          board.is_starred = isStarred;
        }
        return board;
      });
      
      renderBoards();
    } else {
      showAlert('Failed to update board star status', 'danger');
    }
  } catch (error) {
    console.error('Toggle board star error:', error);
    showAlert('Something went wrong. Please try again later.', 'danger');
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
      window.location.href = `/board.html?id=${data.board.id}`;
    } else {
      showAlert(data.error || 'Failed to create board', 'danger');
    }
  } catch (error) {
    console.error('Create board error:', error);
    showAlert('Something went wrong. Please try again later.', 'danger');
  }
}

// Fetch a single board with all lists and cards
async function fetchBoard(boardId) {
  try {
    const response = await fetch(`${API_URL}/boards/${boardId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      state.currentBoard = data.board;
      state.lists = data.board.lists || [];
      renderBoard();
    } else if (response.status === 401) {
      // Unauthorized, redirect to login
      window.location.href = '/login.html';
    } else if (response.status === 403) {
      // Forbidden, user doesn't have access
      showAlert('You do not have access to this board', 'danger');
      setTimeout(() => {
        window.location.href = '/boards.html';
      }, 2000);
    } else if (response.status === 404) {
      // Board not found
      showAlert('Board not found', 'danger');
      setTimeout(() => {
        window.location.href = '/boards.html';
      }, 2000);
    } else {
      showAlert('Failed to fetch board', 'danger');
    }
  } catch (error) {
    console.error('Fetch board error:', error);
    showAlert('Something went wrong. Please try again later.', 'danger');
  }
}

// Render board with lists and cards
function renderBoard() {
  if (!boardView || !listsContainer) return;
  
  document.title = `${state.currentBoard.title} | MMLLO`;
  
  // Update board header
  const boardHeader = document.querySelector('.board-header');
  if (boardHeader) {
    boardHeader.innerHTML = `
      <div class="board-title">${state.currentBoard.title}</div>
      <div class="board-menu">
        <button class="btn btn-primary" id="add-list-btn">Add List</button>
        <button class="btn" id="board-settings-btn">Board Settings</button>
      </div>
    `;
    
    // Set up event listeners
    document.getElementById('add-list-btn').addEventListener('click', showAddListForm);
    document.getElementById('board-settings-btn').addEventListener('click', showBoardSettings);
  }
  
  // Set board background
  document.body.style.backgroundColor = state.currentBoard.background || '#0079bf';
  
  // Render lists
  listsContainer.innerHTML = '';
  
  state.lists.forEach(list => {
    const listElement = document.createElement('div');
    listElement.className = 'list';
    listElement.dataset.id = list.id;
    
    listElement.innerHTML = `
      <div class="list-header">
        <div class="list-title">${list.title}</div>
        <div class="list-menu">
          <span class="list-menu-toggle">⋮</span>
        </div>
      </div>
      <div class="list-cards" data-list-id="${list.id}"></div>
      <div class="add-item" data-list-id="${list.id}">+ Add a card</div>
    `;
    
    listsContainer.appendChild(listElement);
    
    // Render cards for this list
    const listCards = listElement.querySelector('.list-cards');
    
    list.cards.forEach(card => {
      const cardElement = document.createElement('div');
      cardElement.className = 'card';
      cardElement.dataset.id = card.id;
      
      // Prepare labels HTML
      let labelsHtml = '';
      if (card.labels && card.labels.length > 0) {
        labelsHtml = '<div class="card-labels">';
        card.labels.forEach(label => {
          labelsHtml += `<span class="label label-${label}"></span>`;
        });
        labelsHtml += '</div>';
      }
      
      // Prepare badges HTML
      let badgesHtml = '<div class="card-badges">';
      
      if (card.due_date) {
        const dueDate = new Date(card.due_date);
        const isOverdue = dueDate < new Date();
        badgesHtml += `
          <span class="card-badge ${isOverdue ? 'overdue' : ''}">
            <span class="badge-icon">🕒</span>
            ${dueDate.toLocaleDateString()}
          </span>
        `;
      }
      
      // Comments badge
      if (card.comments && card.comments.length > 0) {
        badgesHtml += `
          <span class="card-badge">
            <span class="badge-icon">💬</span>
            ${card.comments.length}
          </span>
        `;
      }
      
      badgesHtml += '</div>';
      
      cardElement.innerHTML = `
        ${labelsHtml}
        <div class="card-title">${card.title}</div>
        ${badgesHtml}
      `;
      
      // Set up event listeners
      cardElement.addEventListener('click', () => openCardDetail(card));
      
      // Set up drag and drop
      cardElement.draggable = true;
      cardElement.addEventListener('dragstart', onDragStart);
      cardElement.addEventListener('dragend', onDragEnd);
      
      listCards.appendChild(cardElement);
    });
    
    // Set up event listeners for adding cards
    listElement.querySelector('.add-item').addEventListener('click', function() {
      showAddCardForm(this.dataset.listId);
    });
    
    // Set up drag and drop for list
    listCards.addEventListener('dragover', onDragOver);
    listCards.addEventListener('drop', onDrop);
  });
  
  // Add "Add a list" container
  const addListContainer = document.createElement('div');
  addListContainer.className = 'list add-list';
  addListContainer.innerHTML = `
    <div class="add-item">+ Add another list</div>
    <div class="add-list-form hidden">
      <input type="text" class="form-control" placeholder="Enter list title">
      <div class="add-list-actions">
        <button class="btn btn-success add-list-submit">Add List</button>
        <button class="btn add-list-cancel">Cancel</button>
      </div>
    </div>
  `;
  
  listsContainer.appendChild(addListContainer);
  
  // Set up event listeners for adding lists
  const addListItem = addListContainer.querySelector('.add-item');
  const addListForm = addListContainer.querySelector('.add-list-form');
  const addListCancel = addListContainer.querySelector('.add-list-cancel');
  const addListSubmit = addListContainer.querySelector('.add-list-submit');
  
  addListItem.addEventListener('click', () => {
    addListItem.classList.add('hidden');
    addListForm.classList.remove('hidden');
    addListForm.querySelector('input').focus();
  });
  
  addListCancel.addEventListener('click', () => {
    addListForm.classList.add('hidden');
    addListItem.classList.remove('hidden');
    addListForm.querySelector('input').value = '';
  });
  
  addListSubmit.addEventListener('click', async () => {
    const title = addListForm.querySelector('input').value.trim();
    
    if (!title) {
      showAlert('Please enter a list title', 'danger');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/lists/board/${state.currentBoard.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ title }),
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Add new list to state
        state.lists.push({
          ...data.list,
          cards: []
        });
        
        // Re-render board
        renderBoard();
      } else {
        const data = await response.json();
        showAlert(data.error || 'Failed to create list', 'danger');
      }
    } catch (error) {
      console.error('Create list error:', error);
      showAlert('Something went wrong. Please try again later.', 'danger');
    }
  });
}

// Utility function to show an alert
function showAlert(message, type) {
  const alertsContainer = document.getElementById('alerts-container');
  
  if (!alertsContainer) {
    console.error('Alerts container not found');
    return;
  }
  
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  
  alertsContainer.appendChild(alert);
  
  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    alert.classList.add('fade-out');
    setTimeout(() => {
      alertsContainer.removeChild(alert);
    }, 500);
  }, 5000);
}

// Drag and drop handlers
function onDragStart(e) {
  e.dataTransfer.setData('text/plain', e.target.dataset.id);
  e.target.classList.add('dragging');
  state.dragging = {
    cardId: e.target.dataset.id,
    listId: e.target.parentElement.dataset.listId
  };
}

function onDragEnd(e) {
  e.target.classList.remove('dragging');
}

function onDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

async function onDrop(e) {
  e.preventDefault();
  
  const cardId = state.dragging.cardId;
  const sourceListId = state.dragging.listId;
  const targetListId = e.currentTarget.dataset.listId;
  
  if (!cardId || !sourceListId || !targetListId) {
    return;
  }
  
  // Get the card element being dragged
  const cardElement = document.querySelector(`.card[data-id="${cardId}"]`);
  
  if (!cardElement) {
    return;
  }
  
  // Determine the position to insert the card at
  let position = 0;
  const cards = Array.from(e.currentTarget.children);
  
  // If dropping onto another card, determine position
  const targetCard = findDropTarget(e.clientY, cards);
  
  if (targetCard) {
    const targetCardData = state.lists
      .find(list => list.id === parseInt(targetListId))
      .cards
      .find(card => card.id === parseInt(targetCard.dataset.id));
    
    position = targetCardData.position;
  } else if (cards.length > 0) {
    // If dropping at the end of the list
    const lastCardData = state.lists
      .find(list => list.id === parseInt(targetListId))
      .cards[cards.length - 1];
    
    position = lastCardData ? lastCardData.position + 1 : 0;
  }
  
  // If moving to another list
  if (sourceListId !== targetListId) {
    try {
      const response = await fetch(`${API_URL}/cards/${cardId}/move-to-list`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          listId: parseInt(targetListId),
          position
        }),
        credentials: 'include'
      });
      
      if (response.ok) {
        // Update local state
        const card = state.lists
          .find(list => list.id === parseInt(sourceListId))
          .cards
          .find(card => card.id === parseInt(cardId));
        
        // Remove card from source list
        state.lists = state.lists.map(list => {
          if (list.id === parseInt(sourceListId)) {
            list.cards = list.cards.filter(c => c.id !== parseInt(cardId));
          }
          return list;
        });
        
        // Add card to target list
        state.lists = state.lists.map(list => {
          if (list.id === parseInt(targetListId)) {
            list.cards.push({
              ...card,
              list_id: parseInt(targetListId),
              position
            });
            list.cards.sort((a, b) => a.position - b.position);
          }
          return list;
        });
        
        // Re-render board
        renderBoard();
      } else {
        const data = await response.json();
        showAlert(data.error || 'Failed to move card', 'danger');
      }
    } catch (error) {
      console.error('Move card error:', error);
      showAlert('Something went wrong. Please try again later.', 'danger');
    }
  } else {
    // Moving within the same list
    try {
      const response = await fetch(`${API_URL}/cards/${cardId}/move`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ position }),
        credentials: 'include'
      });
      
      if (response.ok) {
        // Update local state
        state.lists = state.lists.map(list => {
          if (list.id === parseInt(sourceListId)) {
            const card = list.cards.find(c => c.id === parseInt(cardId));
            card.position = position;
            list.cards.sort((a, b) => a.position - b.position);
          }
          return list;
        });
        
        // Re-render board
        renderBoard();
      } else {
        const data = await response.json();
        showAlert(data.error || 'Failed to move card', 'danger');
      }
    } catch (error) {
      console.error('Move card error:', error);
      showAlert('Something went wrong. Please try again later.', 'danger');
    }
  }
}

// Helper function to find the card element to drop on
function findDropTarget(y, cards) {
  return cards.find(card => {
    const rect = card.getBoundingClientRect();
    return y > rect.top && y < rect.bottom;
  });
}

// Initialize the application
function init() {
  // Check auth status
  checkAuth();
  
  // Set up event listeners based on the current page
  const path = window.location.pathname;
  
  if (path === '/login.html') {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', login);
    }
  } else if (path === '/register.html') {
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', register);
    }
  } else if (path === '/boards.html') {
    fetchBoards();
  } else if (path === '/board.html') {
    const urlParams = new URLSearchParams(window.location.search);
    const boardId = urlParams.get('id');
    
    if (boardId) {
      fetchBoard(boardId);
    } else {
      window.location.href = '/boards.html';
    }
  }
}

// Run initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
