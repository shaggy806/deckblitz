import type { EffectSpec, SearchZones } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 26044.
//
// Fang-Druid Summoner's search: which zones is the player's choice as it
// resolves, and only a search that includes the library shuffles it. The {1}
// is an alternative cost (rule 118.9), so it doesn't combine with another and
// leaves the Rune's mana value alone (the rulings).
const ETB_TEXT =
  "When this creature enters, you may search your library and/or graveyard for a Rune card, reveal it, and put it into your hand. If you search your library this way, shuffle.";
const ALT_TEXT = "You may pay {1} rather than pay the mana cost for Rune spells you cast.";

const search = (zones: SearchZones): EffectSpec => ({
  kind: "search-library",
  filter: { subtype: "Rune" },
  destination: "hand",
  reveal: true,
  min: 0,
  max: 1,
  zones,
});

export default defineCard({
  name: "Runeforge Champion",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dwarf", "Warrior"],
  power: 2,
  toughness: 3,
  text: `${ETB_TEXT}\n${ALT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library and/or graveyard for a Rune card?",
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
      text: ETB_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      alternativeCostForSpells: { mana: "{1}", filter: { subtype: "Rune" } },
      text: ALT_TEXT,
    },
  ],
});
