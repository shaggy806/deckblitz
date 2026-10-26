import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 31297.
//
// "Green or white" is chosen as it resolves (no bullets: not a modal spell
// chosen on casting); the life loss counts every creature that died this way,
// whoever controlled it.

export default defineCard({
  name: "Reign of Terror",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy all green creatures or all white creatures. They can't be regenerated. You lose 2 life for each creature that died this way.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            effect: { kind: "destroy-all", filter: { type: "creature", colors: ["G"] }, cantBeRegenerated: true },
            text: "Destroy all green creatures. They can't be regenerated.",
          },
          {
            effect: { kind: "destroy-all", filter: { type: "creature", colors: ["W"] }, cantBeRegenerated: true },
            text: "Destroy all white creatures. They can't be regenerated.",
          },
        ],
      },
      { kind: "lose-life", amount: { product: [2, { thisWay: "died", who: "each-player" }] } },
    ],
  },
});
