import { defineCard } from "../define.js";

// EDHREC rank 25771. "Target Robot" is any permanent with the Robot type.
const PUMP = "{2}{R}: Target Robot gets +2/+0 until end of turn.";

export default defineCard({
  name: "One-Clown Band",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["artifact", "creature"],
  subtypes: ["Clown", "Robot", "Bard"],
  power: 1,
  toughness: 3,
  text: PUMP,
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false },
      targets: [{ kind: "permanent", filter: { subtype: "Robot" } }],
      effect: { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: PUMP,
    },
  ],
});
