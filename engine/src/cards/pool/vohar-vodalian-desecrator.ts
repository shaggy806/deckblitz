import { defineCard } from "../define.js";

// EDHREC rank 3925.
const LOOT_TEXT = "{T}: Draw a card, then discard a card. If you discarded an instant or sorcery card this way, each opponent loses 1 life and you gain 1 life.";
const CAST_TEXT = "{2}, Sacrifice Vohar: You may cast target instant or sorcery card from your graveyard this turn. If that spell would be put into your graveyard, exile it instead. Activate only as a sorcery.";

export default defineCard({
  name: "Vohar, Vodalian Desecrator",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Merfolk", "Wizard"],
  power: 1,
  toughness: 2,
  text: `${LOOT_TEXT}\n${CAST_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "discarded", filter: { typesAnyOf: ["instant", "sorcery"] } },
            then: {
              kind: "sequence",
              effects: [
                { kind: "lose-life", who: "each-opponent", amount: 1 },
                { kind: "gain-life", amount: 1 },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: LOOT_TEXT,
    },
    {
      cost: { mana: "{2}", tap: false, sacrifice: "self" },
      sorcerySpeed: true,
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["instant", "sorcery"] } }],
      effect: { kind: "grant-play", cards: 0, duration: "end-of-turn", exileAfter: true },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
