import { jwtDecode } from 'jwt-decode';

export function getRoleTypeFromToken() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('JWT token not found');
      return null;
    }
    const decodedToken = jwtDecode(token);
    return decodedToken.roleType;
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
}


export function getIdFromToken(role) {
    try {
        const token = localStorage.getItem('token');
        console.log('Token:', token);  // Log to see if the token is retrieved correctly

        if (!token) {
            console.error('JWT token not found');
            return null;
        }

        const decodedToken = jwtDecode(token);
        console.log('Decoded Token:', decodedToken);
        const roleType = decodedToken.roleType;

        if ((role === "fpc" || role === "hod") && !roleType) {
          console.error('Role type not found in token');
          return null;
        }
        return decodedToken.id;
      } catch (error) {
        console.error('Error decoding JWT token:', error);
        return null;
      }
    }

export const getEmailFromToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.email;
    } catch (error) {
      console.error('Error getting email from token:', error);
      return null;
    }
  };