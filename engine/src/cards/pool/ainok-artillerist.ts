import { defineCard } from "../define.js";

const TEXT = "This creature has reach as long as it has a +1/+1 counter on it. (It can block creatures with flying.)";

export default defineCard({
  name: "Ainok Artillerist",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dog", "Archer"],
  power: 4,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "gte", n: 1 } },
      grantKeywords: ["reach"],
      text: TEXT,
    },
  ],
});
