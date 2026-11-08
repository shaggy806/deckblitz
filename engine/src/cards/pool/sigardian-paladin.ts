import { defineCard } from "../define.js";

const STATIC_TEXT =
  "As long as you've put one or more +1/+1 counters on a creature this turn, this creature has trample and lifelink.";
const GRANT_TEXT =
  "{1}{G}{W}: Target creature you control with a +1/+1 counter on it gains trample and lifelink until end of turn.";

export default defineCard({
  name: "Sigardian Paladin",
  manaCost: "{2}{G}{W}",
  colors: ["G", "W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 4,
  toughness: 4,
  text: `${STATIC_TEXT}\n${GRANT_TEXT}`,
  static: [
    {
      // Put by you, on any creature as it was when they went on (the journal's).
      affects: { scope: "self" },
      condition: { kind: "counters-put-this-turn", counter: "+1/+1", onType: "creature" },
      grantKeywords: ["trample", "lifelink"],
      text: STATIC_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{G}{W}", tap: false },
      targets: [
        {
          kind: "permanent",
          filter: { type: "creature", controlledBy: "you", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: GRANT_TEXT,
    },
  ],
});
