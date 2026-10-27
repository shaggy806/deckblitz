import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 27783.
//
// "That spell or ability's controller" is a becomes-target trigger's
// `"trigger-player"` — whoever controls the targeting spell or ability,
// Lava Runner's own controller included — not a target.

const TEXT =
  "Whenever this creature becomes the target of a spell or ability, that spell or ability's controller sacrifices a land of their choice.";

export default defineCard({
  name: "Lava Runner",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard"],
  power: 2,
  toughness: 2,
  keywords: ["haste"],
  text: `Haste\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self" },
      targets: [],
      effect: { kind: "sacrifice", who: "trigger-player", filter: { type: "land" }, count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
