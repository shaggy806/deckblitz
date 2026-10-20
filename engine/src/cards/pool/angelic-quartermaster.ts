import { defineCard } from "../define.js";

const ETB_TEXT = "When this creature enters, put a +1/+1 counter on each of up to two other target creatures.";

export default defineCard({
  name: "Angelic Quartermaster",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel", "Soldier"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        { kind: "optional", of: { kind: "other", of: "creature" } },
        { kind: "optional", of: { kind: "other", of: { kind: "other", of: "creature" }, than: { slots: [0] } } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
