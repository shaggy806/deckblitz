import { defineCard } from "../define.js";

export default defineCard({
  name: "Kozilek's Command",
  manaCost: "{X}{C}{C}",
  colors: [],
  types: ["kindred", "instant"],
  subtypes: ["Eldrazi"],
  text: "Choose two —\n• Target player creates X 0/1 colorless Eldrazi Spawn creature tokens with \"Sacrifice this token: Add {C}.\"\n• Target player scries X, then draws a card.\n• Exile target creature with mana value X or less.\n• Exile up to X target cards from graveyards.",
  castModal: {
    minModes: 2,
    maxModes: 2,
    modes: [
      {
        text: "Target player creates X 0/1 colorless Eldrazi Spawn creature tokens with \"Sacrifice this token: Add {C}.\"",
        targets: ["player"],
        effect: { kind: "as-player", who: { target: 0 }, effect: { kind: "create-token", token: "Eldrazi Spawn Token", count: "x" } },
      },
      {
        text: "Target player scries X, then draws a card.",
        targets: ["player"],
        effect: {
          kind: "as-player",
          who: { target: 0 },
          effect: {
            kind: "sequence",
            effects: [
              { kind: "scry", amount: "x" },
              { kind: "draw", amount: 1 },
            ],
          },
        },
      },
      {
        text: "Exile target creature with mana value X or less.",
        targets: [{ kind: "permanent", filter: { type: "creature", manaValue: { op: "lte", n: "x" } } }],
        effect: { kind: "exile", target: 0 },
      },
      {
        text: "Exile up to X target cards from graveyards.",
        targets: [{ kind: "any-number", of: { kind: "card-in-graveyard", whose: "any" }, max: "x" }],
        effect: { kind: "for-each-target", from: 0, effect: { kind: "exile", target: 0 }, simultaneous: true },
      },
    ],
  },
});
