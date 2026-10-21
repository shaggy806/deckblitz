import type { EffectSpec, SearchZones } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 22031. Up to two creatures bounced as one event, then Raven
// Clan War-Axe's optional library-and/or-graveyard search for a named card:
// the player says which zones, and only a search that includes the library
// shuffles it. Cast with no targets, it still resolves (the ruling).

const search = (zones: SearchZones): EffectSpec => ({
  kind: "search-library",
  filter: { name: "Jace, Arcane Strategist" },
  destination: "hand",
  reveal: true,
  min: 0,
  max: 1,
  zones,
});

export default defineCard({
  name: "Jace's Ruse",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Return up to two target creatures to their owner's hand. You may search your library and/or graveyard for a card named Jace, Arcane Strategist, reveal it, and put it into your hand. If you search your library this way, shuffle.",
  targets: [{ kind: "any-number", of: "creature", max: 2 }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "for-each-target", from: 0, effect: { kind: "return-to-hand", target: 0 }, simultaneous: true },
      {
        kind: "may",
        prompt: "Search your library and/or graveyard for a card named Jace, Arcane Strategist?",
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
