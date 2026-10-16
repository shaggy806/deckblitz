import { defineCard } from "../define.js";
import type { EffectSpec, SearchZones } from "../../effects.js";

// EDHREC rank 9113. Chapter IV is Scapeshift's shape — the chosen creatures
// are sacrificed together, then the find reads how many actually were
// (`thisWay: "sacrificed"`, a token of a stack counting as one each) — with
// Finale of Devastation's "library and/or graveyard" zones choice, where only
// a search that includes the library shuffles. A card with {X} in its cost
// has X = 0 in the library (the ruling; rule 202.3e).
const search = (zones: SearchZones): EffectSpec => ({
  kind: "search-library",
  filter: { type: "creature", manaValue: { op: "lte", n: { amount: { thisWay: "sacrificed" } } } },
  destination: "battlefield",
  min: 0,
  max: 1,
  zones,
});

export default defineCard({
  name: "The Hunger Tide Rises",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after IV.)\nI, II, III — Create a 1/1 black and green Insect creature token.\nIV — Sacrifice any number of creatures. Search your library and/or graveyard for a creature card with mana value less than or equal to the number of creatures sacrificed this way and put it onto the battlefield. If you search your library this way, shuffle.",
  chapters: [
    {
      at: [1, 2, 3],
      targets: [],
      effect: { kind: "create-token", token: "Insect Token (Black-Green)", count: 1 },
      resolve: null,
      text: "I, II, III — Create a 1/1 black and green Insect creature token.",
    },
    {
      at: [4],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "choose-permanents",
            filter: { type: "creature", controlledBy: "you" },
            upTo: { countOf: { type: "creature", controlledBy: "you" } },
            then: { kind: "sacrifice-target", target: 0 },
            prompt: "Sacrifice any number of creatures",
          },
          {
            kind: "modal",
            minModes: 1,
            maxModes: 1,
            modes: [
              { text: "Search your library and graveyard", effect: search("library-and-graveyard") },
              { text: "Search your library", effect: search("library") },
              { text: "Search your graveyard", effect: search("graveyard") },
            ],
          },
        ],
      },
      resolve: null,
      text: "IV — Sacrifice any number of creatures. Search your library and/or graveyard for a creature card with mana value less than or equal to the number of creatures sacrificed this way and put it onto the battlefield. If you search your library this way, shuffle.",
    },
  ],
});
