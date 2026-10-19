import { defineCard } from "../define.js";

// EDHREC rank 9725.
// Contraband Livestock's d20 table.

export default defineCard({
  name: "Recruitment Drive",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Roll a d20.\n1—9 | Create two 1/1 white Soldier creature tokens.\n10—19 | Create two 2/2 white Knight creature tokens.\n20 | Create three 2/2 white Knight creature tokens.",
  effect: {
    kind: "roll-dice",
    sides: 20,
    table: [
      { min: 1, max: 9, effect: { kind: "create-token", token: "Soldier Token", count: 2 } },
      { min: 10, max: 19, effect: { kind: "create-token", token: "2/2 White Knight Token", count: 2 } },
      { min: 20, effect: { kind: "create-token", token: "2/2 White Knight Token", count: 3 } },
    ],
  },
});
