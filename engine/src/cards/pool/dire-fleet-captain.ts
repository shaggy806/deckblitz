import { defineCard } from "../define.js";

// EDHREC rank 16198. The other attacking Pirates are counted as the ability
// resolves, and the bonus is locked in then (the rulings) — Aurochs' shape.

const TEXT = "Whenever this creature attacks, it gets +1/+1 until end of turn for each other attacking Pirate.";
const OTHER_ATTACKING_PIRATES = {
  countOf: { type: "creature", subtype: "Pirate", attacking: true },
  excludeSelf: true,
} as const;

export default defineCard({
  name: "Dire Fleet Captain",
  manaCost: "{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Orc", "Pirate"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: OTHER_ATTACKING_PIRATES,
        toughness: OTHER_ATTACKING_PIRATES,
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
