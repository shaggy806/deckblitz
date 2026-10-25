import { defineCard } from "../define.js";

// EDHREC rank 15419. "If you do" is the counter actually put: with the Wand
// gone, no counter goes on it and so it deals no damage; with the target
// illegal, the ability doesn't resolve at all (the rulings).

const TEXT =
  "Whenever you cast an instant or sorcery spell, you may put a charge counter on this artifact. If you do, this artifact deals damage equal to the number of charge counters on it to any target.";

export default defineCard({
  name: "Sphinx-Bone Wand",
  manaCost: "{7}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: ["any-target"],
      effect: {
        kind: "may",
        prompt: "Put a charge counter on Sphinx-Bone Wand?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "counters-put" },
              then: { kind: "damage", target: 0, amount: { countersOn: "source", counter: "charge" } },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
