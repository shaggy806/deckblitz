import { defineCard } from "../define.js";

// Urza's Saga. EDHREC rank 31617.

const TEXT = "Whenever this creature becomes blocked by a creature, this creature gets +2/+2 until end of turn.";

export default defineCard({
  name: "Viashino Weaponsmith",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "blocked-by", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
