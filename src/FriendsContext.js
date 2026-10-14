import { createContext, useContext } from 'react';

// Original friend group. Used for existing users (saved stacks) and old shared links.
export const DEFAULT_FRIENDS = [
  { id: 'beatrice', name: 'Beatrice', colorA: '#8bbfff', colorB: '#80cb99' },
  { id: 'farin', name: 'Farin', colorA: '#ffb60c', colorB: '#8e65d3' },
  { id: 'tiffany', name: 'Tiffany', colorA: '#ffc0ec', colorB: '#f6ff96' },
  { id: 'monica', name: 'Monica', colorA: '#ff5454', colorB: '#603c0e' },
  { id: 'andrew', name: 'Andrew', colorA: '#d690ff', colorB: '#65a980' },
  { id: 'marisa', name: 'Marisa', colorA: '#98e3ff', colorB: '#b83a21' }
];

// Gradient suggestions for newly added people
export const COLOR_PALETTE = [
  ['#8bbfff', '#80cb99'],
  ['#ffb60c', '#8e65d3'],
  ['#ffc0ec', '#f6ff96'],
  ['#ff5454', '#603c0e'],
  ['#d690ff', '#65a980'],
  ['#98e3ff', '#b83a21'],
  ['#ffd6a5', '#fdffb6'],
  ['#9bf6ff', '#bdb2ff']
];

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

export function buildFriendsApi(list) {
  const safeList = Array.isArray(list) ? list : [];
  const map = {};
  safeList.forEach((f) => {
    map[f.id] = f;
  });

  const getName = (id) => {
    if (!id) return '';
    if (map[id]) return map[id].name;
    if (id.startsWith('f_')) return 'Removed friend';
    return capitalize(id);
  };

  const getStyle = (id) => {
    const f = map[id];
    const a = f ? f.colorA : '#cccccc';
    const b = f ? f.colorB : '#999999';
    return {
      borderLeft: '4px solid',
      borderImage: `linear-gradient(to bottom, ${a}, ${b}) 1`
    };
  };

  return { getName, getStyle, list: safeList };
}

const FriendsContext = createContext(buildFriendsApi(DEFAULT_FRIENDS));

export const FriendsProvider = FriendsContext.Provider;
export const useFriends = () => useContext(FriendsContext);
