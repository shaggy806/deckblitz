import { defineCard } from "../define.js";

// Rulings: the copy is made on the stack (not cast), resolves before the
// Adventure spell, and is made even if that spell was countered in response
// (`copy-spell` of "trigger-spell" copies it as it last was on the stack).

const TEXT = "Whenever you cast an Adventure instant or sorcery spell, copy it. You may choose new targets for the copy.";

export default defineCard({
  name: "Lucky Clover",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { subtype: "Adventure", typesAnyOf: ["instant", "sorcery"] },
      },
      targets: [],
      effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
