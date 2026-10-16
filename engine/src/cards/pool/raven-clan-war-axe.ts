import type { EffectSpec, SearchZones } from "../../effects.js";
import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 14636. Fang-Druid Summoner's optional library-and/or-graveyard
// search, for a named card (Tower Winder's): the player says which zones, and
// only a search that includes the library shuffles it.

const ENTERS =
  "When this Equipment enters, you may search your library and/or graveyard for a card named Eivor, Battle-Ready, reveal it, and put it into your hand. If you search your library this way, shuffle.";

const search = (zones: SearchZones): EffectSpec => ({
  kind: "search-library",
  filter: { name: "Eivor, Battle-Ready" },
  destination: "hand",
  reveal: true,
  min: 0,
  max: 1,
  zones,
});

export default defineCard({
  name: "Raven Clan War-Axe",
  manaCost: "{1}{R}{W}",
  colors: ["W", "R"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ENTERS}\nEquipped creature gets +2/+0 and has trample.\nEquip {2}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library and/or graveyard for a card named Eivor, Battle-Ready?",
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
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 0],
      grantKeywords: ["trample"],
      text: "Equipped creature gets +2/+0 and has trample.",
    },
  ],
  activated: [equip("{2}")],
});
