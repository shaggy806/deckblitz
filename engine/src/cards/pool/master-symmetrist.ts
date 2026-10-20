import { defineCard } from "../define.js";

const ATTACK_TEXT =
  "Whenever a creature you control with power equal to its toughness attacks, it gains trample until end of turn.";

export default defineCard({
  name: "Master Symmetrist",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Rhino", "Druid"],
  power: 4,
  toughness: 4,
  keywords: ["reach"],
  text: `Reach\n${ATTACK_TEXT}`,
  triggered: [
    {
      // The ruling: P/T is looked at only as it attacks; once triggered, it
      // gains trample whatever its power and toughness become.
      trigger: {
        on: "attacks",
        who: "you-control",
        filter: { type: "creature", power: { op: "eq", n: { own: "toughness" } } },
      },
      targets: [],
      effect: { kind: "grant-keyword", target: "trigger-object", keyword: "trample", duration: "end-of-turn" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
