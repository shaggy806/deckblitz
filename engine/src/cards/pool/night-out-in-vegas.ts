import { defineCard } from "../define.js";

const MODE_TEXT = [
  "Buffet — Create three Food tokens.",
  "See a Show — Create two 2/2 white Performer creature tokens.",
  "Play Games — Search your library for a card, put that card into your hand, discard a card at random, then shuffle.",
  "Go to Sleep — You lose 15 life. Sacrifice Night Out in Vegas.",
] as const;

export default defineCard({
  name: "Night Out in Vegas",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `At the beginning of your upkeep, choose one that hasn't been chosen —\n${MODE_TEXT.map((m) => `• ${m}`).join("\n")}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        notChosenBefore: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: MODE_TEXT[0], effect: { kind: "create-token", token: "Food Token", count: 3 } },
          { text: MODE_TEXT[1], effect: { kind: "create-token", token: "Performer Token", count: 2 } },
          {
            text: MODE_TEXT[2],
            effect: {
              kind: "sequence",
              effects: [
                { kind: "search-library", filter: {}, destination: "hand", min: 1, max: 1 },
                { kind: "discard", target: "you", amount: 1, random: true },
              ],
            },
          },
          {
            text: MODE_TEXT[3],
            effect: { kind: "sequence", effects: [{ kind: "lose-life", amount: 15 }, { kind: "sacrifice-source" }] },
          },
        ],
      },
      resolve: null,
      text: "At the beginning of your upkeep, choose one that hasn't been chosen —",
    },
  ],
});
