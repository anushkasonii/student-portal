import { jwtDecode } from 'jwt-decode';

export function getIdFromToken(role = 'reviewer') {
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
        if (role === 'spc') {
            return decodedToken.id || null;  // Adjust this based on your JWT structure
        } else if (role === 'hod') {
            return decodedToken.id || null;  // Assuming hod_id is in the JWT
        }

        console.error('Invalid role');
        return null;
    } catch (error) {
        console.error('Error decoding JWT token:', error);
        return null;
    }
}