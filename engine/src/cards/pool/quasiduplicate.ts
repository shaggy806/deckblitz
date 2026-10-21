import { defineCard } from "../define.js";

export default defineCard({
  name: "Quasiduplicate",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  flashback: { cost: "{1}{U}{U}", discard: 1, keyword: "jump-start" },
  text: "Create a token that's a copy of target creature you control.\nJump-start (You may cast this card from your graveyard by discarding a card in addition to paying its other costs. Then exile this card.)",
  targets: ["creature-you-control"],
  effect: { kind: "create-token-copy", of: 0, count: 1 },
});
