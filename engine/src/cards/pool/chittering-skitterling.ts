import { defineCard } from "../define.js";

// Corrupted's activation restriction is Glistening Sphere's `condition`;
// "only once each turn" is `oncePerTurn` (rule 602.5g).

const TEXT =
  "Corrupted — Sacrifice an artifact or creature: Draw a card. Activate only if an opponent has three or more poison counters and only once each turn.";

export default defineCard({
  name: "Chittering Skitterling",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Rat"],
  power: 1,
  toughness: 4,
  text: TEXT,
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        sacrifice: { filter: { typesAnyOf: ["artifact", "creature"] } },
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      condition: { kind: "player-counters", counter: "poison", who: "opponent", atLeast: 3 },
      oncePerTurn: true,
      text: TEXT,
    },
  ],
});
