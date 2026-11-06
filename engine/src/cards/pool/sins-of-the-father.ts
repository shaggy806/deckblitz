import { defineCard } from "../define.js";

const I_TEXT = "I — Each opponent sacrifices a nontoken creature of their choice.";
const II_TEXT = "II — For each opponent, you create a 2/1 red Klingon Warrior creature token with haste.";
const III_TEXT =
  "III — Exile target player's graveyard. Each opponent loses life equal to the number of creature cards exiled this way.";

export default defineCard({
  name: "Sins of the Father",
  manaCost: "{3}{B}{R}",
  colors: ["B", "R"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${I_TEXT}\n${II_TEXT}\n${III_TEXT}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "sacrifice", who: "each-opponent", filter: { token: false, type: "creature" }, count: 1 },
      resolve: null,
      text: I_TEXT,
    },
    {
      at: [2],
      targets: [],
      effect: { kind: "create-token", token: "Klingon Warrior Token", count: { countPlayers: "each-opponent" } },
      resolve: null,
      text: II_TEXT,
    },
    {
      at: [3],
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile-graveyard", target: 0 },
          {
            kind: "lose-life",
            amount: { thisWay: "exiled", filter: { type: "creature" } },
            who: "each-opponent",
          },
        ],
      },
      resolve: null,
      text: III_TEXT,
    },
  ],
});
