import { defineCard } from "../define.js";

// EDHREC rank 4430. Battalion as Wojek Halberdiers. First strike and trample
// change characteristics, so they reach the creatures there as it resolves
// (rule 611.2c); "can't be blocked by creature tokens this turn" doesn't, so
// it's a turn-wide rule that binds creatures you control later too.

const TEXT =
  "Battalion — Whenever this creature and at least two other creatures attack, creatures you control gain first strike and trample until end of turn and can't be blocked by creature tokens this turn.";

const yours = { type: "creature", controlledBy: "you" } as const;

export default defineCard({
  name: "Legion Loyalist",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Soldier"],
  power: 1,
  toughness: 1,
  keywords: ["haste"],
  text: `Haste\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      whileCondition: { kind: "controls", filter: { type: "creature", attacking: true }, atLeast: 3 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword-all", filter: yours, keyword: "first-strike", duration: "end-of-turn" },
          { kind: "grant-keyword-all", filter: yours, keyword: "trample", duration: "end-of-turn" },
          {
            kind: "restrict",
            filter: yours,
            restrictions: [],
            cantBeBlockedBy: { type: "creature", token: true },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
