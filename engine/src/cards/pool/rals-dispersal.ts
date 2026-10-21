import type { EffectSpec, SearchZones } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 28856. Guilds of Ravnica. Jace's Ruse's optional search for a
// named card, after one bounce: the player says which zones, and only a search
// that includes the library shuffles it. A target gone illegal stops the whole
// spell, search included (the ruling).

const search = (zones: SearchZones): EffectSpec => ({
  kind: "search-library",
  filter: { name: "Ral, Caller of Storms" },
  destination: "hand",
  reveal: true,
  min: 0,
  max: 1,
  zones,
});

export default defineCard({
  name: "Ral's Dispersal",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return target creature to its owner's hand. You may search your library and/or graveyard for a card named Ral, Caller of Storms, reveal it, and put it into your hand. If you search your library this way, shuffle.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0 },
      {
        kind: "may",
        prompt: "Search your library and/or graveyard for a card named Ral, Caller of Storms?",
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
