import { defineCard } from "../define.js";

// EDHREC rank 24250.

const HEXPROOF_TEXT = "Other creatures you control with counters on them have hexproof.";
const DOUBLE_TEXT =
  "If you would put one or more counters on a creature you control, put twice that many of each of those kinds of counters on that creature instead.";

export default defineCard({
  name: "Dr. Joseph M'Benga",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Doctor"],
  power: 3,
  toughness: 3,
  text: `${HEXPROOF_TEXT}\n${DOUBLE_TEXT}`,
  static: [
    {
      affects: {
        scope: "filter",
        filter: {
          type: "creature",
          controlledBy: "you",
          isSource: false,
          counters: { compare: { op: "gte", n: 1 } },
        },
      },
      grantKeywords: ["hexproof"],
      text: HEXPROOF_TEXT,
    },
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-add-counter",
        multiplier: 2,
        whoPuts: "you",
        filter: { type: "creature", controlledBy: "you" },
      },
      text: DOUBLE_TEXT,
    },
  ],
});
