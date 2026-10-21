import { defineCard } from "../define.js";

// Rulings: it returns only if it's still on the battlefield at the end step
// (a delayed return of "source" acts on this object alone, rule 400.7), and
// it can be activated any number of times before then.

export default defineCard({
  name: "Rakalite",
  manaCost: "{6}",
  colors: [],
  types: ["artifact"],
  text: "{2}: Prevent the next 1 damage that would be dealt to any target this turn. Return this artifact to its owner's hand at the beginning of the next end step.",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["any-target"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "prevent-damage", target: 0, amount: 1 },
          {
            kind: "delayed-trigger",
            at: "next-end-step",
            effect: { kind: "return-to-hand", target: "source" },
            text: "Return Rakalite to its owner's hand.",
          },
        ],
      },
      resolve: null,
      text: "{2}: Prevent the next 1 damage that would be dealt to any target this turn. Return this artifact to its owner's hand at the beginning of the next end step.",
    },
  ],
});
