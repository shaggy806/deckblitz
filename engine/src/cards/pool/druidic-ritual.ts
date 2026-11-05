import { defineCard } from "../define.js";

// The mill isn't offered with fewer than three cards in the library (rule
// 701.17b — the ruling). The return is one move of up to one creature card
// and up to one land card, from anywhere in the graveyard (the ruling).

export default defineCard({
  name: "Druidic Ritual",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "You may mill three cards. Then return up to one creature card and up to one land card from your graveyard to your hand. (To mill a card, put the top card of your library into your graveyard.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "may", prompt: "Mill three cards?", effect: { kind: "mill", target: "you", amount: 3 } },
      {
        kind: "look-and-choose",
        zone: "graveyard",
        min: 0,
        max: 2,
        together: {
          oneEach: [
            { label: "a creature card", filter: { type: "creature" } },
            { label: "a land card", filter: { type: "land" } },
          ],
          text: "up to one creature card and up to one land card",
        },
        destination: "hand",
        leftover: "stay",
      },
    ],
  },
});
