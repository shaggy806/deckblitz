import { defineCard } from "../define.js";

const TEXT = "When Jugan dies, you may distribute five +1/+1 counters among any number of target creatures.";

export default defineCard({
  name: "Jugan, the Rising Star",
  manaCost: "{3}{G}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon", "Spirit"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      // "You may" is choosing no targets: each chosen target gets at least one counter.
      targets: [{ kind: "any-number", of: "creature", min: 0, max: 5 }],
      divided: { total: 5, slot: 0, of: "+1/+1 counters" },
      effect: { kind: "counters-divided", from: 0, counter: "+1/+1" },
      resolve: null,
      text: TEXT,
    },
  ],
});
