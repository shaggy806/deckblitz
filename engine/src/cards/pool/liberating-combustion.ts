import type { EffectSpec, SearchZones } from "../../effects.js";
import { defineCard } from "../define.js";

// Kaladesh (KLD). EDHREC rank 22135.
//
// Chandra's Firemaw's optional library-and/or-graveyard search for a named
// card, after the damage: the player says which zones, and only a search that
// includes the library shuffles it. With the creature gone illegal the spell
// doesn't resolve and nothing is searched for (the ruling).
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
