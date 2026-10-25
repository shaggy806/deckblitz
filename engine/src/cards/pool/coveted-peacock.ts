import { defineCard } from "../define.js";

const TEXT = "Whenever this creature attacks, you may goad target creature defending player controls.";

export default defineCard({
  name: "Coveted Peacock",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT} (Until your next turn, that creature attacks each combat if able and attacks a player other than you if able.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature-defending-player-controls"],
      effect: { kind: "may", prompt: "Goad that creature?", effect: { kind: "goad", target: 0 } },
      resolve: null,
      text: TEXT,
    },
  ],
});
