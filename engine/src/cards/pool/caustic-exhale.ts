import { defineCard } from "../define.js";

// EDHREC rank 16677.
//
// "Behold a Dragon or pay {1}" is a choice of whole costs (rule 601.2b):
// beholding is offered only with a Dragon to behold — a Dragon card revealed
// from the hand or a Dragon you control chosen (701.4a) — and which one is
// asked as the cost is paid.

export default defineCard({
  name: "Caustic Exhale",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  additionalCost: {
    options: [
      { text: "Behold a Dragon", behold: { filter: { subtype: "Dragon" }, text: "a Dragon" } },
      { text: "Pay {1}", mana: "{1}" },
    ],
  },
  text: "As an additional cost to cast this spell, behold a Dragon or pay {1}. (To behold a Dragon, choose a Dragon you control or reveal a Dragon card from your hand.)\nTarget creature gets -3/-3 until end of turn.",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: -3, toughness: -3, duration: "end-of-turn" },
});
