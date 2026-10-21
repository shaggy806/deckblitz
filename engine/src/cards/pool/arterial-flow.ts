import { defineCard } from "../define.js";

// Rulings: the life is lost even by an opponent who couldn't discard, and
// whether you control a Vampire is checked as the spell resolves.
export default defineCard({
  name: "Arterial Flow",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Each opponent discards two cards. If you control a Vampire, each opponent loses 2 life and you gain 2 life.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard", target: "each-opponent", amount: 2 },
      {
        kind: "conditional",
        condition: { kind: "controls", filter: { subtype: "Vampire" }, atLeast: 1 },
        then: {
          kind: "sequence",
          effects: [
            { kind: "lose-life", amount: 2, who: "each-opponent" },
            { kind: "gain-life", amount: 2 },
          ],
        },
      },
    ],
  },
});
