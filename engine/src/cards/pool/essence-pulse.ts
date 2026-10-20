import { defineCard } from "../define.js";

// X is all the life you gained this turn, the 2 from this spell included,
// whatever you lost (the ruling): `turnStat: "life-gained"`.
export default defineCard({
  name: "Essence Pulse",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "You gain 2 life. Each creature gets -X/-X until end of turn, where X is the amount of life you gained this turn.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-life", amount: 2 },
      {
        kind: "modify-pt-all",
        filter: { type: "creature" },
        power: { product: [{ turnStat: "life-gained", who: "you" }, -1] },
        toughness: { product: [{ turnStat: "life-gained", who: "you" }, -1] },
        duration: "end-of-turn",
      },
    ],
  },
});
