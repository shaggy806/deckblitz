import { defineCard } from "../define.js";

// EDHREC rank 21390. "As this creature is turned face up" is a replacement on
// turning it face up (Hooded Hydra's `asTurnedFaceUp`), not a trigger: it has
// the counters as it becomes a 2/1, however it's turned face up.

export default defineCard({
  name: "Bubble Smuggler",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Octopus", "Fish"],
  power: 2,
  toughness: 1,
  text:
    "Disguise {5}{U} (You may cast this card face down for {3} as a 2/2 creature with ward {2}. Turn it face up any time for its disguise cost.)\nAs this creature is turned face up, put four +1/+1 counters on it.",
  morph: { keyword: "disguise", cost: "{5}{U}" },
  asTurnedFaceUp: { counters: 4 },
});
