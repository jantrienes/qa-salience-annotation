import seedrandom from "seedrandom";

export function shuffle(array, seed) {
    var m = array.length, t, i;
    const rng = seedrandom(seed);

    while (m) {

      const rnd = rng();
      i = Math.floor(rnd * m--);

      t = array[m];
      array[m] = array[i];
      array[i] = t;
    }

    return array;
  }
