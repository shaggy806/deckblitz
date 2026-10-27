import { defineCard } from "../define.js";

// Rulings: the {3} is paid (or not) as the trigger resolves; a spell countered
// first is copied as it last existed (Riku of Two Reflections' shape).
const TEXT =
  "Whenever you cast an instant or sorcery spell, you may pay {3}. If you do, copy that spell. You may choose new targets for the copy.";

export default defineCard({
  name: "Mirari",
  manaCost: "{5}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {3} to copy that spell?",
        cost: "{3}",
        effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
