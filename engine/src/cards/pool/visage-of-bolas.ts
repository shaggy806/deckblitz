import type { EffectSpec, SearchZones } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 17846. Niambi, Faithful Healer's optional library-and/or-
// graveyard search for a named card: the player says which zones, and only a
// search that includes the library shuffles it.

const ENTERS =
  "When this artifact enters, you may search your library and/or graveyard for a card named Nicol Bolas, the Deceiver, reveal it, and put it into your hand. If you search your library this way, shuffle.";

const search = (zones: SearchZones): EffectSpec => ({
  kind: "search-library",
  filter: { name: "Nicol Bolas, the Deceiver" },
  destination: "hand",
  reveal: true,
  min: 0,
  max: 1,
  zones,
});

export default defineCard({
  name: "Visage of Bolas",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: `${ENTERS}\n{T}: Add {U}, {B}, or {R}.`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library and/or graveyard for a card named Nicol Bolas, the Deceiver?",
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
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["U", "B", "R"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {U}, {B}, or {R}.",
    },
  ],
});
