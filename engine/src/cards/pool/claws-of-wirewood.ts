import { defineCard } from "../define.js";

export default defineCard({
  name: "Claws of Wirewood",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  cycling: { cost: "{2}" },
  text: "Claws of Wirewood deals 3 damage to each creature with flying and each player.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage-all", filter: { type: "creature", keyword: "flying" }, amount: 3 },
      { kind: "damage", amount: 3, who: "each-player" },
    ],
  },
});
