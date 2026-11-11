import { defineCard } from "../define.js";

const ETB_TEXT = "When this creature enters, suspect it. (It has menace and can't block.)";
const PASS_TEXT =
  "Whenever one or more other creatures you control enter, if this creature is suspected, you may suspect one of the other creatures. If you do, this creature is no longer suspected.";

export default defineCard({
  name: "Frantic Scapegoat",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goat"],
  power: 1,
  toughness: 1,
  keywords: ["haste"],
  text: `Haste\n${ETB_TEXT}\n${PASS_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "suspect", target: "source" },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        otherOnly: true,
        batched: true,
        filter: { type: "creature" },
      },
      condition: { kind: "source", filter: { suspected: true } },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { inSet: "trigger-batch", type: "creature" },
        upTo: 1,
        min: 0,
        prompt: "You may suspect one of the other creatures",
        then: {
          kind: "sequence",
          effects: [
            { kind: "suspect", target: 0 },
            { kind: "unsuspect", target: "source" },
          ],
        },
      },
      resolve: null,
      text: PASS_TEXT,
    },
  ],
});
