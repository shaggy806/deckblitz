import { defineCard } from "../define.js";

// EDHREC rank 18291.

export default defineCard({
  name: "Maximize Velocity",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  flashback: { cost: "{R}", discard: 1, keyword: "jump-start" },
  text: "Target creature gets +1/+1 and gains haste until end of turn.\nJump-start (You may cast this card from your graveyard by discarding a card in addition to paying its other costs. Then exile this card.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
    ],
  },
});
