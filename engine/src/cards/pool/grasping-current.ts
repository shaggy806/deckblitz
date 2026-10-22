import type { EffectSpec, SearchZones } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 24896. Ixalan Planeswalker Deck. Jace's Ruse's bounce, then
// Tower Winder's (not optional) library-and/or-graveyard search for a named
// card: the player says which zones, and only a search that includes the
// library shuffles it. Cast with no targets, it still searches (the ruling).
const search = (zones: SearchZones): EffectSpec => ({
  kind: "search-library",
  filter: { name: "Jace, Ingenious Mind-Mage" },
  destination: "hand",
  reveal: true,
  min: 0,
  max: 1,
  zones,
});

export default defineCard({
  name: "Grasping Current",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Return up to two target creatures to their owner's hand.\nSearch your library and/or graveyard for a card named Jace, Ingenious Mind-Mage, reveal it, and put it into your hand. If you search your library this way, shuffle.",
  targets: [{ kind: "any-number", of: "creature", max: 2 }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "for-each-target", from: 0, effect: { kind: "return-to-hand", target: 0 }, simultaneous: true },
      {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "Search your library and graveyard", effect: search("library-and-graveyard") },
          { text: "Search your library", effect: search("library") },
          { text: "Search your graveyard", effect: search("graveyard") },
        ],
      },
    ],
  },
});
