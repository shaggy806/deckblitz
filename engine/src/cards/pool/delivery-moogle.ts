import type { EffectSpec, SearchZones } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 7148.

const TEXT =
  "When this creature enters, search your library and/or graveyard for an artifact card with mana value 2 or less, reveal it, and put it into your hand. If you search your library this way, shuffle.";

// Tower Winder's shape: which zones is the player's choice as it resolves, and
// only a search that includes the library shuffles it.
const search = (zones: SearchZones): EffectSpec => ({
  kind: "search-library",
  filter: { type: "artifact", manaValue: { op: "lte", n: 2 } },
  destination: "hand",
  reveal: true,
  min: 0,
  max: 1,
  zones,
});

export default defineCard({
  name: "Delivery Moogle",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Moogle"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
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
      text: TEXT,
    },
  ],
});
