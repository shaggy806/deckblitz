import { defineCard } from "../define.js";

// Rule 701.15's goads all end, one-shot ones of any length and whoever made them.
// A static goad isn't a record that can end: its static goes on applying.
const ENTERS_TEXT =
  "When this creature enters, investigate. (Create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")";
const COMBAT_TEXT =
  "At the beginning of combat on your turn, investigate for each goaded creature you control. Then each creature you control is no longer goaded.";
const YOURS = { type: "creature", controlledBy: "you" } as const;

export default defineCard({
  name: "Serene Sleuth",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Detective"],
  power: 2,
  toughness: 2,
  text: `${ENTERS_TEXT}\n${COMBAT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Clue Token", count: 1 },
      resolve: null,
      text: "When this creature enters, investigate.",
    },
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Clue Token", count: { countOf: { ...YOURS, goaded: true } } },
          { kind: "ungoad", filter: YOURS },
        ],
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
