import { defineCard } from "../define.js";

export default defineCard({
  name: "Grasp of Phantoms",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  flashback: { cost: "{7}{U}" },
  text: "Put target creature on top of its owner's library.\nFlashback {7}{U} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: ["creature"],
  effect: { kind: "put-on-library", target: 0, position: "top" },
});
