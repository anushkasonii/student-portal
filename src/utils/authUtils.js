import { jwtDecode } from 'jwt-decode';

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

        // Check role and return the appropriate ID
        if (role === "fpc") return decodedToken.id;
        if (role === "hod") return decodedToken.id;
        console.error('Invalid role');
        return null;

    } catch (error) {
        console.error('Error decoding JWT token:', error);
        return null;
    }
}