import { defineCard } from "../define.js";

export default defineCard({
  name: "Season of Loss",
  manaCost: "{3}{B}{B}",
  types: ["sorcery"],
  text:
    "Choose up to five {P} worth of modes. You may choose the same mode more than once.\n" +
    "{P} — Each player sacrifices a creature of their choice.\n" +
    "{P}{P} — Draw a card for each creature that died under your control this turn.\n" +
    "{P}{P}{P} — Each opponent loses X life, where X is the number of creature cards in your graveyard.",
  castModal: {
    minModes: 0,
    maxModes: 5,
    pawprintBudget: 5,
    repeatModes: true,
    modes: [
      {
        text: "{P} — Each player sacrifices a creature of their choice.",
        pawprints: 1,
        effect: { kind: "sacrifice", who: "each-player", filter: { type: "creature" }, count: 1 },
      },
      {
        text: "{P}{P} — Draw a card for each creature that died under your control this turn.",
        pawprints: 2,
        effect: { kind: "draw", amount: { creaturesDiedThisTurn: true } },
      },
      {
        text: "{P}{P}{P} — Each opponent loses X life, where X is the number of creature cards in your graveyard.",
        pawprints: 3,
        effect: {
          kind: "lose-life",
          who: "each-opponent",
          amount: { countInGraveyard: { type: "creature", ownedBy: "you" } },
        },
      },
    ],
  },
});
