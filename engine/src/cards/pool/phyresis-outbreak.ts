import { defineCard } from "../define.js";

// EDHREC rank 3751. Read per creature, for its own controller, once as this
// resolves (the ruling): a later poison counter doesn't change it.

export default defineCard({
  name: "Phyresis Outbreak",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Each opponent gets a poison counter. Then each creature your opponents control gets -1/-1 until end of turn for each poison counter its controller has.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-player-counters", counter: "poison", amount: 1, who: "each-opponent" },
      {
        kind: "for-each-permanent",
        filter: { type: "creature", controlledBy: "opponent" },
        as: 0,
        effect: {
          kind: "modify-pt",
          target: 0,
          power: { product: [-1, { playerCounters: "poison", who: { controllerOf: 0 } }] },
          toughness: { product: [-1, { playerCounters: "poison", who: { controllerOf: 0 } }] },
          duration: "end-of-turn",
        },
      },
    ],
  },
});
