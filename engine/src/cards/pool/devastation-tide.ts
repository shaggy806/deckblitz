import { defineCard } from "../define.js";

// EDHREC rank 4038.

export default defineCard({
  name: "Devastation Tide",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  miracle: { cost: "{1}{U}" },
  text: "Return all nonland permanents to their owners' hands.\nMiracle {1}{U} (You may cast this card for its miracle cost when you draw it if it's the first card you drew this turn.)",
  effect: { kind: "return-to-hand-all", filter: { notTypes: ["land"] } },
});
