import { defineCard } from "../define.js";

// EDHREC rank 10459.

const ENTER_TEXT =
  "When this creature enters, creatures you control gain trample and get +X/+0 until end of turn, where X is the number of artifacts you control.";

const YOURS = { type: "creature", controlledBy: "you" } as const;

// Craterhoof Behemoth's shape: X is counted once, as the trigger resolves,
// and the creatures it reaches are the ones you control then.
export default defineCard({
  name: "Craterclaw Colossus",
  manaCost: "{4}{R}{R}{R}",
  colors: ["R"],
  types: ["artifact", "creature"],
  subtypes: ["Beast", "Construct"],
  power: 5,
  toughness: 5,
  keywords: ["haste"],
  text: `Haste\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword-all", filter: YOURS, keyword: "trample", duration: "end-of-turn" },
          {
            kind: "modify-pt-all",
            filter: YOURS,
            power: { countOf: { type: "artifact", controlledBy: "you" } },
            toughness: 0,
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
