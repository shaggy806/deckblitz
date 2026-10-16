import { defineCard } from "../define.js";

const TEXT = "Sacrifice any number of permanents you control, then draw that many cards.";

// God-Eternal Bontu's shape, any permanent of yours. Zero is a legal choice
// (the ruling); it's done on resolution, not as a cost.
export default defineCard({
  name: "Pitiless Carnage",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  plot: { cost: "{1}{B}{B}" },
  text: `${TEXT}\nPlot {1}{B}{B} (You may pay {1}{B}{B} and exile this card from your hand. Cast it as a sorcery on a later turn without paying its mana cost. Plot only as a sorcery.)`,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "choose-permanents",
        filter: { controlledBy: "you" },
        upTo: { countOf: { controlledBy: "you" } },
        then: { kind: "sacrifice-target", target: 0 },
        prompt: "Sacrifice any number of permanents",
      },
      { kind: "draw", amount: { thisWay: "sacrificed" } },
    ],
  },
});
