import { defineCard } from "../define.js";

// King Narfi's Betrayal's chapter I: one instant or sorcery card from each
// graveyard, your choice, linked to this Saga (rule 607.2a). The later chapters
// cast one while they resolve (its ruling), paying its costs, with mana of any
// type; the {R} they add comes first.
const I = "I — Exile an instant or sorcery card from each graveyard.";
const II =
  "II, III, IV — Add {R} for each lore counter on this Saga. You may cast an instant or sorcery card exiled with this Saga, and mana of any type can be spent to cast that spell.";

export default defineCard({
  name: "Summon: Esper Valigarmanda",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["enchantment", "creature"],
  subtypes: ["Saga", "Drake"],
  power: 3,
  toughness: 3,
  keywords: ["flying", "haste"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after IV.)\n${I}\n${II}\nFlying, haste`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "each-player",
        effect: {
          kind: "look-and-choose",
          zone: "graveyard",
          from: "that-player",
          min: 1,
          max: 1,
          filter: { typesAnyOf: ["instant", "sorcery"] },
          destination: "exile",
          leftover: "stay",
        },
      },
      resolve: null,
      text: I,
    },
    {
      at: [2, 3, 4],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-mana", mana: "R", amount: { countersOn: "source", counter: "lore" } },
          {
            kind: "cast-now",
            from: "exiled-with-source",
            spell: { typesAnyOf: ["instant", "sorcery"] },
            spendAs: "any-type",
          },
        ],
      },
      resolve: null,
      text: II,
    },
  ],
});
