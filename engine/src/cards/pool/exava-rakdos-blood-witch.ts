import { defineCard } from "../define.js";

export default defineCard({
  name: "Exava, Rakdos Blood Witch",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 3,
  toughness: 3,
  keywords: ["first-strike", "haste", "unleash"],
  text: "First strike, haste\nUnleash (You may have this creature enter with a +1/+1 counter on it. It can't block as long as it has a +1/+1 counter on it.)\nEach other creature you control with a +1/+1 counter on it has haste.",
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
        excludeSelf: true,
      },
      grantKeywords: ["haste"],
      text: "Each other creature you control with a +1/+1 counter on it has haste.",
    },
  ],
});
