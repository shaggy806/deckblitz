import { defineCard } from "../define.js";

// EDHREC rank 17327.
//
// Rulings:
//   [2024-04-12] You may choose zero, one, two, or three targets for Boom Box’s ability.

const TEXT =
  "{6}, {T}, Sacrifice this artifact: Destroy up to one target artifact, up to one target creature, and up to one target land.";

// Zero to three targets (the ruling), each its own instance of "target", so
// an artifact creature may fill both of its slots (rule 601.2c). One
// instruction: they're destroyed at once.
export default defineCard({
  name: "Boom Box",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{6}", tap: true, sacrifice: "self" },
      targets: [
        { kind: "optional", of: "artifact" },
        { kind: "optional", of: "creature" },
        { kind: "optional", of: { kind: "permanent", filter: { type: "land" } } },
      ],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "destroy", target: 0 },
          { kind: "destroy", target: 1 },
          { kind: "destroy", target: 2 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
