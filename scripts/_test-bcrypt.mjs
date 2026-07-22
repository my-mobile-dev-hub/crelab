import { hashSync, compareSync } from 'bcryptjs';
const h = hashSync('password123', 10);
console.log('Hash:', h);
console.log('Format valid:', h.startsWith('$2'));
console.log('Verify:', compareSync('password123', h));
