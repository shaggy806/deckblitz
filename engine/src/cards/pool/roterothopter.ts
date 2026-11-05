import { defineCard } from "../define.js";

// EDHREC rank 22970.

export default defineCard({
  name: "Roterothopter",
  manaCost: "{1}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Thopter"],
  power: 0,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\n{2}: This creature gets +1/+0 until end of turn. Activate no more than twice each turn.",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{2}: This creature gets +1/+0 until end of turn. Activate no more than twice each turn.",
      timesEachTurn: 2,
    },
  ],
});
