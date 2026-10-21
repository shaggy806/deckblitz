import type { EffectSpec, SearchZones } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 25080. Rivals of Ixalan.
//
// Both targets are required to cast it; with one illegal as it resolves the
// other is still affected and the search still happens (the rulings).
// Vraska's Stoneglare's optional library-and/or-graveyard search.

const search = (zones: SearchZones): EffectSpec => ({
  kind: "search-library",
  filter: { name: "Angrath, Minotaur Pirate" },
  destination: "hand",
  reveal: true,
  min: 0,
  max: 1,
  zones,
});

export default defineCard({
  name: "Angrath's Fury",
  manaCost: "{3}{B}{R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  text: "Destroy target creature. Angrath's Fury deals 3 damage to target player or planeswalker. You may search your library and/or graveyard for a card named Angrath, Minotaur Pirate, reveal it, and put it into your hand. If you search your library this way, shuffle.",
  targets: ["creature", "player-or-planeswalker"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "damage", amount: 3, target: 1 },
      {
        kind: "may",
        prompt: "Search your library and/or graveyard for a card named Angrath, Minotaur Pirate?",
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
