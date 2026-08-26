import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const AUTHORS = [
  { name: 'Sanjay K.C', role: 'Editor in Chief' },
  { name: 'Sandhya K.C', role: 'Tech Correspondent' },
  { name: 'Saanvi KC', role: 'Startup Analyst' },
  { name: 'Sonu Karki', role: 'Gadget Reviewer' }
];

export function getDeterministicAuthor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AUTHORS.length;
  return AUTHORS[index];
}

export function getPokemonAvatar(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Use first 151 Pokemon for clean avatars
  const pokemonId = (Math.abs(hash) % 151) + 1;
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
}
