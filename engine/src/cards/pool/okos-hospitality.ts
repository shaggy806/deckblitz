import type { EffectSpec, SearchZones } from "../../effects.js";
import { defineCard } from "../define.js";

const search = (zones: SearchZones): EffectSpec => ({
  kind: "search-library",
  filter: { name: "Oko, the Trickster" },
  destination: "hand",
  reveal: true,
  min: 0,
  max: 1,
  zones,
});

export default defineCard({
  name: "Oko's Hospitality",
  manaCost: "{3}{G}{U}",
  colors: ["U", "G"],
  types: ["instant"],
  text: "Creatures you control have base power and toughness 3/3 until end of turn. You may search your library and/or graveyard for a card named Oko, the Trickster, reveal it, and put it into your hand. If you search your library this way, shuffle.",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "animate-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 3,
        toughness: 3,
        duration: "end-of-turn",
      },
      {
        kind: "may",
        prompt: "Search your library and/or graveyard for a card named Oko, the Trickster?",
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
