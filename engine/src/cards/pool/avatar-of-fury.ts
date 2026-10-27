import { defineCard } from "../define.js";

// Prophecy (PCY). EDHREC rank 17341.
//
// Rulings:
//   [2004-10-04] The mana value of this card is still 8, even if you only pay {R}{R} to cast it.

export default defineCard({
  name: "Avatar of Fury",
  manaCost: "{6}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: "If an opponent controls seven or more lands, this spell costs {6} less to cast.\nFlying\n{R}: This creature gets +1/+0 until end of turn.",
  // "An opponent" — one opponent with seven or more, which `opponent-controls`
  // counts per player.
  selfCostReduction: {
    condition: { kind: "opponent-controls", filter: { type: "land" }, atLeast: 7 },
    reduceGeneric: 6,
  },
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{R}: This creature gets +1/+0 until end of turn.",
    },
  ],
});
