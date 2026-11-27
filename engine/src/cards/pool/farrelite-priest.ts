import { defineCard } from "../define.js";

// Initiates of the Ebon Hand's ability in white: a mana ability (rule
// 605.1a), its count read as it resolves, this activation among them.
const MANA_TEXT =
  "{1}: Add {W}. If this ability has been activated four or more times this turn, sacrifice this creature at the beginning of the next end step.";

export default defineCard({
  name: "Farrelite Priest",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 3,
  text: MANA_TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "W",
        amount: 1,
        also: {
          kind: "conditional",
          condition: { kind: "activated-this-turn", atLeast: 4 },
          then: {
            kind: "delayed-trigger",
            at: { step: "end" },
            effect: { kind: "sacrifice-source" },
            text: "Sacrifice Farrelite Priest.",
          },
        },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
