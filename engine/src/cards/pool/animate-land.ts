import { defineCard } from "../define.js";

// EDHREC rank 24891.

export default defineCard({
  name: "Animate Land",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Until end of turn, target land becomes a 3/3 creature that's still a land.",
  targets: ["land"],
  effect: {
    kind: "animate",
    target: 0,
    power: 3,
    toughness: 3,
    addTypes: ["creature"],
    addSubtypes: [],
    duration: "end-of-turn",
  },
});
