import { defineCard } from "../define.js";

const TEXT =
  "At the beginning of combat on your turn, if you control two or more multicolored permanents, this creature gains double strike until end of turn.";

export default defineCard({
  name: "Scuttling Butler",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 4,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      // Intervening "if" (rule 603.4): checked as it triggers and as it resolves.
      condition: { kind: "controls", filter: { multicolored: true }, atLeast: 2 },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "double-strike", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
