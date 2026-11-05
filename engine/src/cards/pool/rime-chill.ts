import { defineCard } from "../define.js";

export default defineCard({
  name: "Rime Chill",
  manaCost: "{6}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Vivid — This spell costs {1} less to cast for each color among permanents you control.\nTap up to two target creatures. Put a stun counter on each of them. (If a permanent with a stun counter would become untapped, remove one from it instead.)\nDraw a card.",
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { colorsAmong: { controlledBy: "you" } },
  },
  targets: [{ kind: "optional", of: "creature" }, { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } }],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        together: true,
        effects: [
          { kind: "tap", target: 0 },
          { kind: "tap", target: 1 },
          { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
          { kind: "add-counter", target: 1, counter: "stun", amount: 1 },
        ],
      },
      { kind: "draw", amount: 1 },
    ],
  },
});
