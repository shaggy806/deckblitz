import type { EffectSpec, SearchZones } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 22099.
//
// Rulings:
//   [2020-06-23] If the target creature is an illegal target by the time Liliana's Scorn tries to
//     resolve, the spell won't resolve. You won't search for Liliana, Death Mage. If the target is
//     legal but not destroyed (most likely because it has indestructible), you do search for
//     Liliana.
//
// The search is Raven Clan War-Axe's optional library-and/or-graveyard one.

const search = (zones: SearchZones): EffectSpec => ({
  kind: "search-library",
  filter: { name: "Liliana, Death Mage" },
  destination: "hand",
  reveal: true,
  min: 0,
  max: 1,
  zones,
});

export default defineCard({
  name: "Liliana's Scorn",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy target creature. You may search your library and/or graveyard for a card named Liliana, Death Mage, reveal it, and put it into your hand. If you search your library this way, shuffle.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "may",
        prompt: "Search your library and/or graveyard for a card named Liliana, Death Mage?",
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
