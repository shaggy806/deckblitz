import { defineCard } from "../define.js";

// EDHREC rank 23704.

const MANA_TEXT =
  "Federation — {5}, {T}: Choose a color. Add an amount of mana of that color equal to the number of creature types among non-Borg creatures you control.";

// "Choose a color" is one colour for all of it (as Three Tree City); the
// count is Captain Jonathan Archer's distinct creature types.
export default defineCard({
  name: "Starfleet Academy",
  supertypes: ["legendary"],
  types: ["land"],
  text: `{T}: Add {C}.\n${MANA_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{5}", tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: {
          aggregate: "distinct",
          of: { subtypesOf: "creature" },
          filter: { type: "creature", controlledBy: "you", notSubtypes: ["Borg"] },
        },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
