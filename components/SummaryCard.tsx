// import React from 'react';
// import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';

// interface SummaryCardProps {
//   title: string;
//   value: string;
//   onPress: () => void; 
// }

// const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, onPress }) => {
//   return (
//     <TouchableOpacity onPress={onPress} style={styles.card}>
//       <Text style={styles.title}>{title}</Text>
//       <Text style={styles.value}>{value}</Text>
//     </TouchableOpacity>
//   );
// };

// const styles = StyleSheet.create({
//   card: {
//     backgroundColor: '#F0FFF0', 
//     borderWidth: 1,
//     borderColor: '#F0FFF0', 
//     borderRadius: 10,
//     flex: 1,
//     height: 120, 
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#2C3E50', 
//   },
//   value: {
//     fontSize: 24,
//     fontWeight: '600',
//     marginTop: 8,
//     color: '#333', 
//   },
// });

// export default SummaryCard;