import { defineCard } from "../define.js";

// EDHREC rank 19317.

export default defineCard({
  name: "Vanishment",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Put target nonland permanent on top of its owner's library.\nMiracle {U} (You may cast this card for its miracle cost when you draw it if it's the first card you drew this turn.)",
  miracle: { cost: "{U}" },
  targets: ["nonland-permanent"],
  effect: { kind: "put-on-library", target: 0, position: "top" },
});
