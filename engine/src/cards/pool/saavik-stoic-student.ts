import { defineCard } from "../define.js";

const ENTER_TEXT =
  "Federation — When Saavik enters, she deals X damage to target attacking or blocking creature an opponent controls, where X is the number of creature types among non-Borg creatures you control.";

export default defineCard({
  name: "Saavik, Stoic Student",
  manaCost: "{4}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vulcan", "Advisor"],
  power: 2,
  toughness: 2,
  keywords: ["flash"],
  text: `Flash\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "permanent",
          whose: "opponent",
          filter: { type: "creature", anyOf: [{ attacking: true }, { blocking: true }] },
        },
      ],
      effect: {
        kind: "damage",
        // Federation's X: the different creature types among your non-Borg creatures.
        amount: {
          aggregate: "distinct",
          of: { subtypesOf: "creature" },
          filter: { type: "creature", controlledBy: "you", notSubtypes: ["Borg"] },
        },
        target: 0,
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
