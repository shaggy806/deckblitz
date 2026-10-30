import { defineCard } from "../define.js";

// Alara Reborn (ARB). "Another permanent … that shares a permanent type with
// it": chosen as the trigger resolves, never the one that entered
// (`exceptTriggerObject`), sharing a permanent type with it (rule 110.4 —
// kindred doesn't count). "You may": choosing none is the answer.

const TEXT =
  "Whenever a nonartifact permanent you control enters, you may return another permanent you control that shares a permanent type with it to its owner's hand.";

export default defineCard({
  name: "Cloudstone Curio",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { notTypes: ["artifact"] } },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { controlledBy: "you", sharesPermanentTypeWith: "trigger-object" },
        exceptTriggerObject: true,
        upTo: 1,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "You may return another permanent you control that shares a permanent type with it",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
