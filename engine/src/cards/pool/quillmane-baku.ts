import { defineCard } from "../define.js";

// EDHREC rank 29212.

export default defineCard({
  name: "Quillmane Baku",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 3,
  text: "Whenever you cast a Spirit or Arcane spell, you may put a ki counter on this creature.\n{1}, {T}, Remove X ki counters from this creature: Return target creature with mana value X or less to its owner's hand.",
  activated: [
    {
      // Cruel Sadist's "Remove X counters" cost, Stir the Grave's X filter.
      cost: { mana: "{1}", tap: true, removeCounter: { kind: "ki", count: "x" } },
      targets: [{ kind: "permanent", filter: { type: "creature", manaValue: { op: "lte", n: "x" } } }],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: "{1}, {T}, Remove X ki counters from this creature: Return target creature with mana value X or less to its owner's hand.",
    },
  ],
  triggered: [
    {
      // Petalmane Baku's.
      trigger: { on: "cast-spell", who: "you", filter: { anyOf: [{ subtype: "Spirit" }, { subtype: "Arcane" }] } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a ki counter on Quillmane Baku?",
        effect: { kind: "add-counter", target: "source", counter: "ki", amount: 1 },
      },
      resolve: null,
      text: "Whenever you cast a Spirit or Arcane spell, you may put a ki counter on this creature.",
    },
  ],
});
