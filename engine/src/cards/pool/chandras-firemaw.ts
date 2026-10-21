import type { EffectSpec, SearchZones } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 19959. Raven Clan War-Axe's optional library-and/or-graveyard
// search for a named card: the player says which zones, and only a search
// that includes the library shuffles it.

const ENTERS =
  "When this creature enters, you may search your library and/or graveyard for a card named Chandra, Flame's Catalyst, reveal it, and put it into your hand. If you search your library this way, shuffle.";

const search = (zones: SearchZones): EffectSpec => ({
  kind: "search-library",
  filter: { name: "Chandra, Flame's Catalyst" },
  destination: "hand",
  reveal: true,
  min: 0,
  max: 1,
  zones,
});

export default defineCard({
  name: "Chandra's Firemaw",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Hellion"],
  power: 4,
  toughness: 2,
  keywords: ["haste"],
  text: `Haste\n${ENTERS}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library and/or graveyard for a card named Chandra, Flame's Catalyst?",
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
      resolve: null,
      text: ENTERS,
    },
  ],
});
