import { defineCard } from "../define.js";

export default defineCard({
  name: "Cloak and Phaser",
  manaCost: "{8}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Strange new worlds — This spell costs {X} less to cast, where X is the number of differently named lands you control.\nCreate two 2/2 black Romulan creature tokens. Draw two cards, then discard a card.",
  selfCostReduction: {
    // Unconditional: the always-true gate Ghalta uses. Only the generic part comes off.
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { aggregate: "distinct", of: "name", filter: { type: "land", controlledBy: "you" } },
  },
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Romulan Token", count: 2 },
      { kind: "draw", amount: 2 },
      { kind: "discard", target: "you", amount: 1 },
    ],
  },
});
