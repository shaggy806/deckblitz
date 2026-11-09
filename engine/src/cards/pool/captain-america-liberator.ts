import { defineCard } from "../define.js";

// EDHREC rank 17928. The count reads him as he last existed if he's gone in
// response (`wasAttachedTo`, rule 608.2h).
export default defineCard({
  name: "Captain America, Liberator",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Hero"],
  power: 5,
  toughness: 5,
  text: "When Captain America enters, you may search your library for an Equipment card with mana value 3 or less, put it onto the battlefield, then shuffle.\nWhenever Captain America attacks, for each Equipment attached to him, create a 1/1 white Soldier creature token.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for an Equipment card with mana value 3 or less?",
        effect: { kind: "search-library", filter: { subtype: "Equipment", manaValue: { op: "lte", n: 3 } }, destination: "battlefield", min: 0, max: 1 },
      },
      resolve: null,
      text: "When Captain America enters, you may search your library for an Equipment card with mana value 3 or less, put it onto the battlefield, then shuffle.",
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Soldier Token", count: { countOf: { subtype: "Equipment", wasAttachedTo: "source" } } },
      resolve: null,
      text: "Whenever Captain America attacks, for each Equipment attached to him, create a 1/1 white Soldier creature token.",
    },
  ],
});
