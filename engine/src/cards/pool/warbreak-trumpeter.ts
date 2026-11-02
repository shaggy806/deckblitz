import { defineCard } from "../define.js";

// EDHREC rank 22414. Two {X}: each X costs {2} as it's turned face up.
const UP_TEXT = "When this creature is turned face up, create X 1/1 red Goblin creature tokens.";

export default defineCard({
  name: "Warbreak Trumpeter",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 1,
  toughness: 1,
  text: `Morph {X}{X}{R}\n${UP_TEXT}`,
  morph: { keyword: "morph", cost: "{X}{X}{R}" },
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Goblin Token", count: { triggerValue: true } },
      resolve: null,
      text: UP_TEXT,
    },
  ],
});
