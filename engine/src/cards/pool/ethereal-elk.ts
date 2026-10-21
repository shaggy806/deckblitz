import type { EffectSpec, SearchZones } from "../../effects.js";
import { defineCard } from "../define.js";

const ENTER_TEXT =
  "When this creature enters, you may search your library and/or graveyard for a card named Vivien, Nature's Avenger, reveal it, and put it into your hand. If you search your library this way, shuffle.";

const search = (zones: SearchZones): EffectSpec => ({
  kind: "search-library",
  filter: { name: "Vivien, Nature's Avenger" },
  destination: "hand",
  reveal: true,
  min: 0,
  max: 1,
  zones,
});

export default defineCard({
  name: "Ethereal Elk",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elk", "Spirit"],
  power: 3,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library and/or graveyard for a card named Vivien, Nature's Avenger?",
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
      text: ENTER_TEXT,
    },
  ],
});
