import { defineCard } from "../define.js";

// EDHREC rank 29208.
//
// "Target creature it's blocking" is a creature blocked by this one
// (`blockingRelation: "blocked-by"` — Tinder Wall); both are destroyed at
// once. Any player may activate it (`anyPlayer`).
const TEXT = "{3}: Destroy this creature and target creature it's blocking. Any player may activate this ability.";

export default defineCard({
  name: "Wall of Vipers",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Snake", "Wall"],
  power: 2,
  toughness: 4,
  keywords: ["defender"],
  text: `Defender (This creature can't attack.)\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", blockingRelation: { relation: "blocked-by" } } }],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "destroy", target: "source" },
          { kind: "destroy", target: 0 },
        ],
      },
      anyPlayer: true,
      resolve: null,
      text: TEXT,
    },
  ],
});
