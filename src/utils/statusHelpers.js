export const getStatusColor = (status) => {
  switch (status) {
    case 'Approved':
      return '#28a745'; // Green
    case 'Rejected':
      return '#dc3545'; // Red
    case 'rework':
      return '#ffc107'; // Yellow
    default:
      return '#6c757d'; // Gray
  }
};

export const getStatusTextColor = (status) => {
  return status === 'rejected' ? '#fff' : '#000'; // Example logic for text color
};