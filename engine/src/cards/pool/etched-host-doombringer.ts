import { defineCard } from "../define.js";

// EDHREC rank 24327. March of the Machine.
//
// "If an opponent protects it" is read from the controller's side as the
// ability resolves.

export default defineCard({
  name: "Etched Host Doombringer",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Demon"],
  power: 3,
  toughness: 5,
  text: "When this creature enters, choose one —\n• Target opponent loses 2 life and you gain 2 life.\n• Choose target battle. If an opponent protects it, remove three defense counters from it. Otherwise, put three defense counters on it.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Target opponent loses 2 life and you gain 2 life.",
            targets: ["opponent"],
            effect: {
              kind: "sequence",
              effects: [
                { kind: "lose-life", amount: 2, target: 0 },
                { kind: "gain-life", amount: 2 },
              ],
            },
          },
          {
            text: "Choose target battle. If an opponent protects it, remove three defense counters from it. Otherwise, put three defense counters on it.",
            targets: [{ kind: "permanent", filter: { type: "battle" } }],
            effect: {
              kind: "conditional",
              condition: { kind: "target", index: 0, filter: { type: "battle", protectedBy: "opponent" } },
              then: { kind: "remove-counter", target: 0, counter: "defense", amount: 3 },
              else: { kind: "add-counter", target: 0, counter: "defense", amount: 3 },
            },
          },
        ],
      },
      resolve: null,
      text: "When this creature enters, choose one —",
    },
  ],
});
