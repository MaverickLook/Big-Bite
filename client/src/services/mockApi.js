// Mock database (simulate backend)
const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123', // In real app, never store plain passwords!
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
  },
];

// Mock login
export const mockLogin = (email, password) => {
  return new Promise((resolve, reject) => {
    // Simulate network delay
    setTimeout(() => {
      const user = mockUsers.find(u => u.email === email);
      
      if (!user) {
        reject({
          response: {
            status: 401,
            data: { message: 'User not found' }
          }
        });
        return;
      }

      if (user.password !== password) {
        reject({
          response: {
            status: 401,
            data: { message: 'Invalid password' }
          }
        });
        return;
      }

      // Create mock JWT token
      const mockToken = `mock_jwt_${user.id}_${Date.now()}`;

      resolve({
        data: {
          token: mockToken,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          }
        }
      });
    }, 500); // Simulate 500ms network delay
  });
};

// Mock register
export const mockRegister = (name, email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Check if user already exists
      const userExists = mockUsers.find(u => u.email === email);
      
      if (userExists) {
        reject({
          response: {
            status: 400,
            data: { message: 'Email already registered' }
          }
        });
        return;
      }

      // Create new user
      const newUser = {
        id: String(mockUsers.length + 1),
        name,
        email,
        password,
      };

      mockUsers.push(newUser);
      const mockToken = `mock_jwt_${newUser.id}_${Date.now()}`;

      resolve({
        data: {
          token: mockToken,
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
          }
        }
      });
    }, 500);
  });
};

// Mock logout
export const mockLogout = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: { message: 'Logged out successfully' } });
    }, 300);
  });
};
