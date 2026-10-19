import { defineCard } from "../define.js";

const ATTACK_TEXT = "Whenever this creature attacks, goad target creature an opponent controls.";

export default defineCard({
  name: "Taunting Kobold",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Kobold"],
  power: 0,
  toughness: 1,
  keywords: ["haste"],
  text: `Haste\n${ATTACK_TEXT} (Until your next turn, that creature attacks each combat if able and attacks a player other than you if able.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "goad", target: 0 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
