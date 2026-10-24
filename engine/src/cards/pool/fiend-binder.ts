import { defineCard } from "../define.js";

// Eldritch Moon. EDHREC rank 28299. The target is a creature controlled by
// the player this creature attacks, or by the controller of the planeswalker
// it attacks (the ruling).
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
