import { defineCard } from "../define.js";

// EDHREC rank 27322.
//
// Rulings:
//   [2011-01-01] If the mana cost of the targeted card includes {X}, X is considered to be 0.
//   [2011-01-01] If the artifact card in your graveyard is an illegal target by the time the
//     ability resolves, the ability won’t resolve. You won’t gain any life.

export default defineCard({
  name: "Razor Hippogriff",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Hippogriff"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, return target artifact card from your graveyard to your hand. You gain life equal to that card's mana value.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "artifact" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "return-to-hand", target: 0, from: "graveyard" },
          { kind: "gain-life", amount: { manaValueOf: 0 } },
        ],
      },
      resolve: null,
      text: "When this creature enters, return target artifact card from your graveyard to your hand. You gain life equal to that card's mana value.",
    },
  ],
});
