import type { EffectSpec, SearchZones } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 22135.
//
// "You may search your library and/or graveyard" is Chandra's Firemaw's
// shape: a `may` over a `modal` of the three `search-library` `zones`, where
// only a search that includes the library shuffles. An illegal target stops
// the whole spell, search and all (the ruling).

const search = (zones: SearchZones): EffectSpec => ({
  kind: "search-library",
  filter: { name: "Chandra, Pyrogenius" },
  destination: "hand",
  reveal: true,
  min: 0,
  max: 1,
  zones,
});

export default defineCard({
  name: "Liberating Combustion",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Liberating Combustion deals 6 damage to target creature. You may search your library and/or graveyard for a card named Chandra, Pyrogenius, reveal it, and put it into your hand. If you search your library this way, shuffle.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 6, target: 0 },
      {
        kind: "may",
        prompt: "Search your library and/or graveyard for a card named Chandra, Pyrogenius?",
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
      },
    ],
  },
});
