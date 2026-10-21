import { defineCard } from "../define.js";

// EDHREC rank 7303. Birthing Pod's shape: the mana value is the sacrificed
// creature's as it last existed ({X} counts as 0, a plain token's is 0).

const TEXT =
  "{T}, Sacrifice another creature: Search your library for a creature card with mana value equal to 1 plus the sacrificed creature's mana value, put that card onto the battlefield, then shuffle. Activate only as a sorcery.";

export default defineCard({
  name: "Prime Speaker Vannifar",
  manaCost: "{2}{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Ooze", "Wizard"],
  power: 2,
  toughness: 4,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "creature-you-control" },
      otherOnly: true,
      sorcerySpeed: true,
      targets: [],
      effect: {
        kind: "search-library",
        filter: {
          type: "creature",
          manaValue: { op: "eq", n: { amount: { sum: [{ manaValueOf: "sacrificed" }, 1] } } },
        },
        destination: "battlefield",
        min: 0,
        max: 1,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
