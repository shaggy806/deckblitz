import { defineCard } from "../define.js";

// EDHREC rank 14007.
//
// Rulings:
//   [2025-01-24] Bedlam Reveler's first ability can't reduce the {R}{R} in its cost.
//   [2025-01-24] If you have no cards in hand when Bedlam Reveler's enters ability resolves, you
//     just draw three cards.
//
// Overwhelming Remorse's reduction: generic mana only, so never below {R}{R}.

export default defineCard({
  name: "Bedlam Reveler",
  manaCost: "{6}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Devil", "Horror"],
  power: 3,
  toughness: 4,
  text: "This spell costs {1} less to cast for each instant and sorcery card in your graveyard.\nProwess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)\nWhen this creature enters, discard your hand, then draw three cards.",
  selfCostReduction: {
    // Unconditional: the always-true gate Blasphemous Act uses.
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { cardsInGraveyard: { typesAnyOf: ["instant", "sorcery"] } },
  },
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)",
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard-hand", who: "you" },
          { kind: "draw", amount: 3 },
        ],
      },
      resolve: null,
      text: "When this creature enters, discard your hand, then draw three cards.",
    },
  ],
});
