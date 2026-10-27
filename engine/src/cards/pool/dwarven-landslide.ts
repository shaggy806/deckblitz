import { defineCard } from "../define.js";

// EDHREC rank 26915.

export default defineCard({
  name: "Dwarven Landslide",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Kicker—{2}{R}, Sacrifice a land. (You may pay {2}{R} and sacrifice a land in addition to any other costs as you cast this spell.)\nDestroy target land. If this spell was kicked, destroy another target land.",
  targets: ["land"],
  effect: { kind: "destroy", target: 0 },
  kicker: {
    cost: "{2}{R}",
    also: { text: "Sacrifice a land", sacrifice: { filter: { type: "land" }, count: 1 } },
    targets: ["land", { kind: "other", of: "land", than: { slots: [0] } }],
    effect: {
      kind: "sequence",
      effects: [
        { kind: "destroy", target: 0 },
        { kind: "destroy", target: 1 },
      ],
    },
  },
});
