import { defineCard } from "../define.js";

// EDHREC rank 19997.

export default defineCard({
  name: "Maximize Altitude",
  manaCost: "{U}",
  colors: ["U"],
  types: ["sorcery"],
  flashback: { cost: "{U}", discard: 1, keyword: "jump-start" },
  text: "Target creature gets +1/+1 and gains flying until end of turn.\nJump-start (You may cast this card from your graveyard by discarding a card in addition to paying its other costs. Then exile this card.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
    ],
  },
});
