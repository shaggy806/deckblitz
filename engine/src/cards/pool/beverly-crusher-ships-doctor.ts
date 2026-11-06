import { defineCard } from "../define.js";

const TEXT =
  "Seek out — Whenever you draw your second card each turn, put a +1/+1 counter on each of up to three target creatures.";

export default defineCard({
  name: "Beverly Crusher, Ship's Doctor",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Doctor"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: [{ kind: "any-number", of: "creature", max: 3 }],
      effect: {
        kind: "for-each-target",
        from: 0,
        effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
        simultaneous: true,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
