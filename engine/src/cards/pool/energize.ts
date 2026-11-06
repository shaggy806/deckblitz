import { defineCard } from "../define.js";


export default defineCard({
  name: "Energize",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  flashback: {
    cost: "{3}{U}",
    returnToHand: { filter: { type: "creature" }, count: 1 },
    keyword: "beam-me-up",
  },
  text: "Return target creature an opponent controls to its owner's hand.\nBeam me up {3}{U} (You may cast this card from your graveyard for {3}{U} if you also return a creature you control to its owner's hand. Then exile this spell.)",
  targets: ["creature-an-opponent-controls"],
  effect: { kind: "return-to-hand", target: 0 },
});
