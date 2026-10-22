import type { EffectSpec, SearchZones } from "../../effects.js";
import { defineCard } from "../define.js";

// Amonkhet. Niambi, Faithful Healer's library-and/or-graveyard search for a
// named card: the player says which zones, and only a search that includes
// the library shuffles it.
const ENTERS =
  "When this enchantment enters, you may search your library and/or graveyard for a card named Gideon, Martial Paragon, reveal it, and put it into your hand. If you search your library this way, shuffle.";

const search = (zones: SearchZones): EffectSpec => ({
  kind: "search-library",
  filter: { name: "Gideon, Martial Paragon" },
  destination: "hand",
  reveal: true,
  min: 0,
  max: 1,
  zones,
});

export default defineCard({
  name: "Gideon's Resolve",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${ENTERS}\nCreatures you control get +1/+1.`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library and/or graveyard for a card named Gideon, Martial Paragon?",
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
  static: [{ affects: { scope: "creatures-you-control" }, grantPt: [1, 1], text: "Creatures you control get +1/+1." }],
});
