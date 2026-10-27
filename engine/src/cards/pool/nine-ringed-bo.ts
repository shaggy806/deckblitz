import { defineCard } from "../define.js";

// Champions of Kamigawa. EDHREC rank 30892. Ruling: the creature is exiled
// even if the Bo has left the battlefield — the replacement is on the
// creature (`exile-if-dies-this-turn`), not the Bo.

const TEXT = "{T}: This artifact deals 1 damage to target Spirit creature. If that creature would die this turn, exile it instead.";

export default defineCard({
  name: "Nine-Ringed Bo",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", subtype: "Spirit" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 1, target: 0 },
          { kind: "exile-if-dies-this-turn", target: 0 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
