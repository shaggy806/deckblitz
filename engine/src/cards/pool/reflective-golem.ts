import { defineCard } from "../define.js";

const TEXT =
  "Whenever you cast an instant or sorcery spell that targets only this creature, you may pay {2}. If you do, copy that spell. You may choose new targets for the copy.";

export default defineCard({
  name: "Reflective Golem",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { typesAnyOf: ["instant", "sorcery"], targets: { only: true, source: true } },
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2} to copy that spell?",
        cost: "{2}",
        effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
