import { defineCard } from "../define.js";

// EDHREC rank 23953. The card is discarded first; then each player in turn
// order from the active player may pay 5 life, and only if none does is it
// put onto the battlefield (the ruling) — `unless` with `"any-player"`.
const TEXT =
  "At the beginning of your upkeep, discard a card at random. If you discard a creature card this way, return it from your graveyard to the battlefield unless any player pays 5 life.";

export default defineCard({
  name: "Aether Rift",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "you", amount: 1, random: true },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "discarded", filter: { type: "creature" } },
            then: {
              kind: "unless",
              chooser: "any-player",
              options: [{ payLife: 5, text: "Pay 5 life" }],
              otherwise: {
                kind: "return-from-graveyard",
                filter: { thisWay: "discarded", type: "creature" },
                destination: "battlefield",
                count: "all",
              },
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
