import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 32093.

const NO_FLYING = { kind: "permanent", filter: { type: "creature", notKeyword: "flying" } } as const;

export default defineCard({
  name: "Wave Elemental",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 2,
  toughness: 3,
  text: "{U}, {T}, Sacrifice this creature: Tap up to three target creatures without flying.",
  activated: [
    {
      cost: { mana: "{U}", tap: true, sacrifice: "self" },
      targets: [
        { kind: "optional", of: NO_FLYING },
        { kind: "optional", of: { kind: "other", of: NO_FLYING, than: { slot: 0 } } },
        { kind: "optional", of: { kind: "other", of: NO_FLYING, than: { slots: [0, 1] } } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "tap", target: 1 },
          { kind: "tap", target: 2 },
        ],
      },
      resolve: null,
      text: "{U}, {T}, Sacrifice this creature: Tap up to three target creatures without flying.",
    },
  ],
});
