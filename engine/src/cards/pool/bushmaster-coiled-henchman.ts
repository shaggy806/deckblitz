import { defineCard } from "../define.js";

// EDHREC rank 15543. Marvel Super Heroes Commander.
const GRANT_TEXT = "Each other creature you control with a +1/+1 counter on it has deathtouch.";

export default defineCard({
  name: "Bushmaster, Coiled Henchman",
  manaCost: "{1}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Snake", "Human", "Villain"],
  power: 2,
  toughness: 1,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${GRANT_TEXT}`,
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
        excludeSelf: true,
      },
      grantKeywords: ["deathtouch"],
      text: GRANT_TEXT,
    },
  ],
});
