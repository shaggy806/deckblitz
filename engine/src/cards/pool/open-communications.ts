import { defineCard } from "../define.js";


export default defineCard({
  name: "Open Communications",
  manaCost: "{U}",
  colors: ["U"],
  types: ["sorcery"],
  flashback: {
    cost: "{2}{U}",
    returnToHand: { filter: { type: "creature" }, count: 1 },
    keyword: "beam-me-up",
  },
  text: "Draw a card.\nBeam me up {2}{U} (You may cast this card from your graveyard for {2}{U} if you also return a creature you control to its owner's hand. Then exile this spell.)",
  effect: { kind: "draw", amount: 1 },
});
