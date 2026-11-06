import { defineCard } from "../define.js";


export default defineCard({
  name: "Transporter Malfunction",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  flashback: {
    cost: "{3}{R}{R}{R}",
    returnToHand: { filter: { type: "creature" }, count: 1 },
    keyword: "beam-me-up",
  },
  text: "Transporter Malfunction deals 3 damage to any target.\nBeam me up {3}{R}{R}{R} (You may cast this card from your graveyard for {3}{R}{R}{R} if you also return a creature you control to its owner's hand. Then exile this spell.)",
  targets: ["any-target"],
  effect: { kind: "damage", amount: 3, target: 0 },
});
