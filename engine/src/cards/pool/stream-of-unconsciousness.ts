import { defineCard } from "../define.js";

// EDHREC rank 18943. Morningtide.
//
// Rulings:
//   [2024-06-07] This cards was originally printed with the "tribal" card type. That card type has
//     been replaced with "kindred". This change does not affect the gameplay function of this
//     card.
//   [2024-06-07] Kindred is a card type that allows noncreature cards to have creature types.
//   [2024-06-07] While it appears only on cards that already have other card types, kindred is a
//     card type and will be counted by effects that refer to the number of card types among cards
//     in a zone.

export default defineCard({
  name: "Stream of Unconsciousness",
  manaCost: "{U}",
  colors: ["U"],
  types: ["kindred", "instant"],
  subtypes: ["Wizard"],
  text: "Target creature gets -4/-0 until end of turn. If you control a Wizard, draw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: -4, toughness: 0, duration: "end-of-turn" },
      {
        kind: "conditional",
        condition: { kind: "controls", filter: { subtype: "Wizard" }, atLeast: 1 },
        then: { kind: "draw", amount: 1 },
      },
    ],
  },
});
