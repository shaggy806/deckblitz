import { defineCard } from "../define.js";

export default defineCard({
  name: "Spitting Image",
  manaCost: "{4}{G/U}{G/U}",
  colors: ["U", "G"],
  types: ["sorcery"],
  retrace: true,
  text: "Create a token that's a copy of target creature.\nRetrace (You may cast this card from your graveyard by discarding a land card in addition to paying its other costs.)",
  targets: ["creature"],
  effect: { kind: "create-token-copy", of: 0, count: 1 },
});
