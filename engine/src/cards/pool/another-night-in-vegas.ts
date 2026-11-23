import { defineCard } from "../define.js";

const UPKEEP_TEXT = "At the beginning of your upkeep, choose one that hasn't been chosen —";

export default defineCard({
  name: "Another Night in Vegas",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${UPKEEP_TEXT}\n• Wake Up! — Return target creature card from a graveyard to its owner's hand.\n• VIP Line Access — Search your library for a card, then shuffle and put that card on top.\n• Life of the Party — Whenever a spell is cast this turn, you gain 2 life.\n• Breakfast at Dawn — Create two Food tokens. Sacrifice this enchantment.`,
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
          {
            text: "Wake Up! — Return target creature card from a graveyard to its owner's hand.",
            targets: [{ kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } }],
            effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
          },
          {
            text: "VIP Line Access — Search your library for a card, then shuffle and put that card on top.",
            // `library-top` puts the find back on top after the search's shuffle (Vampiric Tutor).
            effect: { kind: "search-library", filter: {}, destination: "library-top", min: 1, max: 1 },
          },
          {
            text: "Life of the Party — Whenever a spell is cast this turn, you gain 2 life.",
            effect: {
              kind: "delayed-trigger",
              at: { whenever: { on: "cast-spell", who: "any" } },
              effect: { kind: "gain-life", amount: 2 },
              text: "Whenever a spell is cast this turn, you gain 2 life.",
            },
          },
          {
            text: "Breakfast at Dawn — Create two Food tokens. Sacrifice this enchantment.",
            effect: {
              kind: "sequence",
              effects: [
                { kind: "create-token", token: "Food Token", count: 2 },
                { kind: "sacrifice-source" },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
