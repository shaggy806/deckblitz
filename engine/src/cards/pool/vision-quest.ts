import type { EffectSpec, SearchZones } from "../../effects.js";
import { defineCard } from "../define.js";

// "Your library and/or graveyard" is the player's choice of zones as it
// resolves (a `modal` over `search-library`'s `zones`, as Finale of
// Devastation's), only a search including the library shuffling. The find
// enters with X +1/+1 counters (`withCounters`, rule 122.6), and with X 4 or
// more gains haste — the search's `then`, the find as its target.
const search = (zones: SearchZones): EffectSpec => ({
  kind: "search-library",
  filter: { types: ["artifact", "creature"], manaValue: { op: "lte", n: "x" } },
  destination: "battlefield",
  min: 0,
  max: 1,
  zones,
  withCounters: { kind: "+1/+1", amount: "x" },
  then: {
    kind: "conditional",
    condition: { kind: "x", compare: { op: "gte", n: 4 } },
    then: { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
  },
});

export default defineCard({
  name: "Vision Quest",
  manaCost: "{X}{U}{R}",
  colors: ["U", "R"],
  types: ["sorcery"],
  text:
    "Search your library and/or graveyard for an artifact creature card with mana value X or less and put it onto the battlefield with X additional +1/+1 counters on it. If X is 4 or greater, it gains haste until end of turn. If you search your library this way, shuffle.",
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
});
