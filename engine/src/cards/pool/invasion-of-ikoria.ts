import type { EffectSpec, SearchZones } from "../../effects.js";
import { defineCard } from "../define.js";

// Finale of Devastation's search, its zones the player's choice as it resolves:
// only a search that includes the library shuffles.
const ENTERS_TEXT =
  "When this Siege enters, search your library and/or graveyard for a non-Human creature card with mana value X or less and put it onto the battlefield. If you search your library this way, shuffle.";

const search = (zones: SearchZones): EffectSpec => ({
  kind: "search-library",
  filter: { type: "creature", notSubtypes: ["Human"], manaValue: { op: "lte", n: "x" } },
  destination: "battlefield",
  min: 0,
  max: 1,
  zones,
});

export default defineCard({
  name: "Invasion of Ikoria",
  manaCost: "{X}{G}{G}",
  colors: ["G"],
  types: ["battle"],
  subtypes: ["Siege"],
  defense: 6,
  text: `(As a Siege enters, choose an opponent to protect it. You and others can attack it. When it's defeated, exile it, then cast it transformed.)\n${ENTERS_TEXT}`,
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
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "Search your library and graveyard", effect: search("library-and-graveyard") },
          { text: "Search your library", effect: search("library") },
          { text: "Search your graveyard", effect: search("graveyard") },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  faces: ["Invasion of Ikoria", "Zilortha, Apex of Ikoria"],
  transform: true,
});
