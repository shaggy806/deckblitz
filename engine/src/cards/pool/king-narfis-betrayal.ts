import { defineCard } from "../define.js";

// Kaldheim. Chapter I: every player mills four, then you may exile a creature
// or planeswalker card from each graveyard — one at most from each, your
// choice, linked to this Saga (rule 607.2a). Chapters II and III: until end of
// turn, cast any number of spells from among the cards exiled with it (lands
// aren't spells: they can't be played), spending mana as though it were any
// colour to cast them (rule 609.4b), at their normal timing and paying their
// costs. The permission outlasts the Saga's sacrifice after III (rule 113.7a).
const ONE =
  "I — Each player mills four cards. Then you may exile a creature or planeswalker card from each graveyard.";
const TWO =
  "II, III — Until end of turn, you may cast spells from among cards exiled with this Saga, and you may spend mana as though it were mana of any color to cast those spells.";

export default defineCard({
  name: "King Narfi's Betrayal",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${ONE}\n${TWO}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "each-player", amount: 4 },
          {
            kind: "for-each-player",
            who: "each-player",
            effect: {
              kind: "look-and-choose",
              zone: "graveyard",
              from: "that-player",
              min: 0,
              max: 1,
              filter: { typesAnyOf: ["creature", "planeswalker"] },
              destination: "exile",
              leftover: "stay",
            },
          },
        ],
      },
      resolve: null,
      text: ONE,
    },
    {
      at: [2, 3],
      targets: [],
      effect: { kind: "player-effect", duration: "end-of-turn", mayPlay: { from: "exile", linked: true, spendAs: "any-color" } },
      resolve: null,
      text: TWO,
    },
  ],
});
