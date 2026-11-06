import { defineCard } from "../define.js";

const TEXT = "When Chancellor Gorkon dies, exile up to two target creatures.";

export default defineCard({
  name: "Chancellor Gorkon",
  manaCost: "{3}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Klingon", "Noble"],
  power: 5,
  toughness: 3,
  keywords: ["vigilance"],
  text: `Vigilance\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [
        { kind: "optional", of: "creature" },
        { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
      ],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "exile", target: 0 },
          { kind: "exile", target: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
