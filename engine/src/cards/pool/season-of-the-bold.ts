import { defineCard } from "../define.js";

const WATCH_TEXT =
  "Until the end of your next turn, whenever you cast a spell, Season of the Bold deals 2 damage to up to one target creature.";

export default defineCard({
  name: "Season of the Bold",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text:
    "Choose up to five {P} worth of modes. You may choose the same mode more than once.\n" +
    "{P} — Create a tapped Treasure token.\n" +
    "{P}{P} — Exile the top two cards of your library. Until the end of your next turn, you may play them.\n" +
    `{P}{P}{P} — ${WATCH_TEXT}`,
  castModal: {
    minModes: 0,
    maxModes: 5,
    pawprintBudget: 5,
    repeatModes: true,
    modes: [
      {
        text: "{P} — Create a tapped Treasure token.",
        pawprints: 1,
        effect: { kind: "create-token", token: "Treasure Token", count: 1, tapped: true },
      },
      {
        text: "{P}{P} — Exile the top two cards of your library. Until the end of your next turn, you may play them.",
        pawprints: 2,
        effect: { kind: "impulse-exile", amount: 2, duration: "until-end-of-your-next-turn", play: true },
      },
      {
        text: `{P}{P}{P} — ${WATCH_TEXT}`,
        pawprints: 3,
        effect: {
          kind: "delayed-trigger",
          at: {
            whenever: { on: "cast-spell", who: "you" },
            until: "until-end-of-your-next-turn",
            targets: [{ kind: "optional", of: "creature" }],
          },
          effect: { kind: "damage", amount: 2, target: 0 },
          text: "Whenever you cast a spell, Season of the Bold deals 2 damage to up to one target creature.",
        },
      },
    ],
  },
});
