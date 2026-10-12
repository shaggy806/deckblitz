import { defineCard } from "../define.js";

// EDHREC rank 15954.
//
// "Behold a Jace or pay {1}": a choice of whole costs (rule 601.2b). A Jace
// is a Jace planeswalker card in hand or a Jace you control — an empowered
// Jace token too (701.4a).
// Makes Jace → use "Jace Token".

export default defineCard({
  name: "Countersculpt",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["instant"],
  additionalCost: {
    options: [
      { text: "Behold a Jace", behold: { filter: { subtype: "Jace" }, text: "a Jace" } },
      { text: "Pay {1}", mana: "{1}" },
    ],
  },
  text: "As an additional cost to cast this spell, behold a Jace or pay {1}. (To behold a Jace, choose a Jace you control or reveal a Jace card from your hand.)\nCounter target spell. Empower Jace 1. (Put a loyalty counter on a Jace token you control. If you don't control one, first create a blue Jace planeswalker token with \"[−1]: Surveil 1\" and \"[−3]: Draw a card.\")",
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "counter", target: 0 }, { kind: "empower-jace", amount: 1 }],
  },
});
