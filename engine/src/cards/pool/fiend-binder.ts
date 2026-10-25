import { defineCard } from "../define.js";

// EDHREC rank 28299.

const TEXT = "Whenever this creature attacks, tap target creature defending player controls.";

export default defineCard({
  name: "Fiend Binder",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature-defending-player-controls"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
