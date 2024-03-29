
export const customMode4 = [
  [91, 92, 93, 94, 95, 96, 97, 98, 99],
  [81, 82, 83, 84, 85, 86, 87, 88, 89],
  [71, 72, 73, 74, 75, 76, 77, 78, 79],
  [61, 62, 63, 64, 65, 66, 67, 68, 69],
  [51, 52, 53, 54, 55, 56, 57, 58, 59],
  [41, 42, 43, 44, 45, 46, 47, 48, 49],
  [31, 32, 33, 34, 35, 36, 37, 38, 39],
  [21, 22, 23, 24, 25, 26, 27, 28, 29],
  [11, 12, 13, 14, 15, 16, 17, 18, 19],
];

export const customMode4XY = {};
export const customMode4XY2 = {};
for (let x = 0; x < customMode4.length; x++) {
  for (let y = 0; y < customMode4[x].length; y++) {
    customMode4XY[customMode4[x][y]] = {x, y, key: `${x}:${y}`};
    customMode4XY2[`${x}:${y}`] = customMode4[x][y];
  }
}

export const customMode3 = [
  [91, 92, 93, 94, 95, 96, 97, 98, 99],
  [64, 65, 66, 67, 96, 97, 98, 99, 89],
  [60, 61, 62, 63, 92, 93, 94, 95, 79],
  [56, 57, 58, 59, 88, 89, 90, 91, 69],
  [52, 53, 54, 55, 84, 85, 86, 87, 59],
  [48, 49, 50, 51, 80, 81, 82, 83, 49],
  [44, 45, 46, 47, 76, 77, 78, 79, 39],
  [40, 41, 42, 43, 72, 73, 74, 75, 29],
  [36, 37, 38, 39, 68, 69, 70, 71, 19],
];
export const customMode3XY = {};
export const customMode3XY2 = {};
for (let x = 0; x < customMode3.length; x++) {
  for (let y = 0; y < customMode3[x].length; y++) {
    customMode3XY[customMode3[x][y]] = `${x}:${y}`;
    customMode3XY2[`${x}:${y}`] = customMode3[x][y];
  }
}
