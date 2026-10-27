import { defineCard } from "../define.js";

const BLOCK_TEXT = "This creature can't block creatures with power greater than this creature's power.";

// Both powers are read as blockers are declared (rule 509.1b).
export default defineCard({
  name: "Spitfire Handler",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 1,
  toughness: 1,
  text: `${BLOCK_TEXT}\n{R}: This creature gets +1/+0 until end of turn.`,
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{R}: This creature gets +1/+0 until end of turn.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      canBlockOnly: { power: { op: "lte", n: { amount: { powerOf: "source" } } } },
      text: BLOCK_TEXT,
    },
  ],
});
