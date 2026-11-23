import { defineCard } from "../define.js";

// A playtest card (Mystery Booster). Each player chooses which X creature
// cards, then which X land cards, of their own graveyard return (all of them
// if they have fewer), as Fall of the Thran's chapters are written.

export default defineCard({
  name: "Life Cloud",
  manaCost: "{X}{W}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Each player gains X life, draws X cards, returns X creatures from their graveyard to the battlefield, then returns X lands from their graveyard to the battlefield.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-life", amount: "x", who: "each-player" },
      { kind: "draw", amount: "x", who: "each-player" },
      {
        kind: "for-each-player",
        who: "each-player",
        effect: {
          kind: "look-and-choose",
          zone: "graveyard",
          player: "that-player",
          filter: { type: "creature" },
          min: "x",
          max: "x",
          destination: "battlefield",
          leftover: "stay",
        },
      },
      {
        kind: "for-each-player",
        who: "each-player",
        effect: {
          kind: "look-and-choose",
          zone: "graveyard",
          player: "that-player",
          filter: { type: "land" },
          min: "x",
          max: "x",
          destination: "battlefield",
          leftover: "stay",
        },
      },
    ],
  },
});
