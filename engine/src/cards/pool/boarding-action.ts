import { defineCard } from "../define.js";


export default defineCard({
  name: "Boarding Action",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  flashback: {
    cost: "{2}{R}",
    returnToHand: { filter: { type: "creature" }, count: 1 },
    keyword: "beam-me-up",
  },
  text: "Create a 2/1 red Klingon Warrior creature token with haste.\nBeam me up {2}{R} (You may cast this card from your graveyard for {2}{R} if you also return a creature you control to its owner's hand. Then exile this spell.)",
  effect: { kind: "create-token", token: "Klingon Warrior Token", count: 1 },
});
