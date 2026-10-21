import { defineCard } from "../define.js";

const TEXT = "Whenever this creature attacks, tap target creature defending player controls.";

export default defineCard({
  name: "Star-Crowned Stag",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elk"],
  power: 3,
  toughness: 3,
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
