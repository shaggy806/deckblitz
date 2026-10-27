import { defineCard } from "../define.js";

// EDHREC rank 22944. The look is a choose-from-zone with nothing to pick (max 0), so the caster
// sees the three cards before deciding; then "you may" put them all on the bottom in an order of
// their choice (Stomping Slabs' bottom-any-order with max 0) and return the spell from the stack
// to its owner's hand (Revive the Fallen's shape) — or, declining, draw three.
//
// Rulings:
//   [2013-06-07] If you choose to put the three cards on the bottom of your library, Petals of
//     Insight will return to your hand directly from the stack. It never goes to a graveyard.

export default defineCard({
  name: "Petals of Insight",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["sorcery"],
  subtypes: ["Arcane"],
  text: "Look at the top three cards of your library. You may put those cards on the bottom of your library in any order. If you do, return Petals of Insight to its owner's hand. Otherwise, draw three cards.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "look-and-choose", zone: "library", count: 3, min: 0, max: 0, destination: "hand", leftover: "stay" },
      {
        kind: "may",
        prompt: "Put those cards on the bottom of your library and return Petals of Insight to your hand?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "look-and-choose", zone: "library", count: 3, min: 0, max: 0, destination: "hand", leftover: "bottom-any-order" },
            { kind: "return-to-hand", target: "source", from: "stack" },
          ],
        },
        else: { kind: "draw", amount: 3 },
      },
    ],
  },
});
