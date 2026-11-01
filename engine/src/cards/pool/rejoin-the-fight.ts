import { defineCard } from "../define.js";

// Each opponent chooses from the same graveyard, a card no one before them has
// chosen, and the chosen cards return together. It's a sorcery, so the turn
// order's opponents start with the next one.
export default defineCard({
  name: "Rejoin the Fight",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text:
    "Mill three cards. Then starting with the next opponent in turn order, each opponent chooses a creature card in " +
    "your graveyard that hasn't been chosen. Return each card chosen this way to the battlefield under your control.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "mill", target: "you", amount: 3 },
      {
        kind: "for-each-player",
        who: "each-opponent",
        choicesHeld: true,
        effect: {
          kind: "look-and-choose",
          zone: "graveyard",
          chooser: "that-player",
          min: 1,
          max: 1,
          filter: { type: "creature" },
          destination: "battlefield",
          leftover: "stay",
        },
      },
    ],
  },
});
