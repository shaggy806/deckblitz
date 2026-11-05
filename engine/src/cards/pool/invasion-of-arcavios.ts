import type { EffectSpec, SearchZones } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 10562.
//
// "Search your library, graveyard, and/or outside the game": which of the three
// is the player's choice as it resolves, and only a search that includes the
// library shuffles it. `searchZonesAndOr` over the seven sets, with the third
// zone being `outside`.

const SEARCH_TEXT =
  "When this Siege enters, search your library, graveyard, and/or outside the game for an instant or sorcery card you own, reveal it, and put it into your hand. If you search your library this way, shuffle.";

const search = (zones: SearchZones): Extract<EffectSpec, { kind: "search-library" }> => ({
  kind: "search-library",
  filter: { typesAnyOf: ["instant", "sorcery"] },
  destination: "hand",
  reveal: true,
  min: 0,
  max: 1,
  zones,
});

export default defineCard({
  name: "Invasion of Arcavios",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["battle"],
  subtypes: ["Siege"],
  defense: 7,
  text: `(As a Siege enters, choose an opponent to protect it. You and others can attack it. When it's defeated, exile it, then cast it transformed.)\n${SEARCH_TEXT}`,
  triggered: [
    {
      trigger: { on: "counters-removed", who: "self", counter: "defense", last: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: "source" },
          { kind: "cast-now", from: "source-exiled-this-way", free: true, transformed: true },
        ],
      },
      resolve: null,
      text: "When the last defense counter is removed from this permanent, exile it, then you may cast it transformed without paying its mana cost.",
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modal",
            minModes: 1,
            maxModes: 1,
            modes: [
              {
                text: "Search your library, graveyard, and outside the game",
                effect: { ...search("library-and-graveyard"), outside: true },
              },
              { text: "Search your library and graveyard", effect: search("library-and-graveyard") },
              { text: "Search your library and outside the game", effect: { ...search("library"), outside: true } },
              { text: "Search your graveyard and outside the game", effect: { ...search("graveyard"), outside: true } },
              { text: "Search your library", effect: search("library") },
              { text: "Search your graveyard", effect: search("graveyard") },
              { text: "Search outside the game", effect: { ...search("library"), outside: "only" } },
            ],
          },
        ],
      },
      resolve: null,
      text: SEARCH_TEXT,
    },
  ],
  faces: ["Invasion of Arcavios", "Invocation of the Founders"],
  transform: true,
});
