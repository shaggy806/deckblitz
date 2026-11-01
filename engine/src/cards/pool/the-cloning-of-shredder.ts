import { defineCard } from "../define.js";

// Chapter I exiles the card with this Saga (rule 607.2a), which chapters II and
// III read: "a card" is a choice only if a copied chapter I put a second one
// there. The token copies what was printed on the card (the ruling); "isn't
// legendary" and "is a Mutant" are copiable values of it (rule 707.9b).
const CHAPTER_I =
  "I — Exile target creature card from your graveyard. Create a token that's a copy of it, except it isn't legendary and is a Mutant in addition to its other types.";
const CHAPTER_II_III =
  "II, III — Create a token that's a copy of a card exiled with this Saga, except it isn't legendary and is a Mutant in addition to its other types.";

export default defineCard({
  name: "The Cloning of Shredder",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text:
    "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n" +
    `${CHAPTER_I}\n${CHAPTER_II_III}`,
  chapters: [
    {
      at: [1],
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0, linked: true },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "exiled" },
            then: {
              kind: "create-token-copy",
              of: 0,
              count: 1,
              who: "you",
              asCard: true,
              notLegendary: true,
              exceptions: { addSubtypes: ["Mutant"] },
            },
          },
        ],
      },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2, 3],
      targets: [],
      effect: {
        kind: "create-token-copy",
        of: "exiled-with-source",
        chooseOne: true,
        count: 1,
        notLegendary: true,
        exceptions: { addSubtypes: ["Mutant"] },
      },
      resolve: null,
      text: CHAPTER_II_III,
    },
  ],
});
