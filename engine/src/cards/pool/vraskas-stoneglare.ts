import type { EffectSpec, SearchZones } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 24498.
//
// Rulings:
//   The life gained is the destroyed creature's toughness as it last existed
//   on the battlefield — or as it is now, if it wasn't destroyed
//   (indestructible). If the target is illegal, the spell doesn't resolve: no
//   life, no search.
//
// Noxious Gearhulk's toughness (last-known, rule 608.2h) and Liliana's Scorn's
// optional library-and/or-graveyard search.

const search = (zones: SearchZones): EffectSpec => ({
  kind: "search-library",
  filter: { name: "Vraska, Regal Gorgon" },
  destination: "hand",
  reveal: true,
  min: 0,
  max: 1,
  zones,
});

export default defineCard({
  name: "Vraska's Stoneglare",
  manaCost: "{4}{B}{G}",
  colors: ["B", "G"],
  types: ["sorcery"],
  text: "Destroy target creature. You gain life equal to its toughness. You may search your library and/or graveyard for a card named Vraska, Regal Gorgon, reveal it, and put it into your hand. If you search your library this way, shuffle.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "gain-life", amount: { toughnessOf: 0 } },
      {
        kind: "may",
        prompt: "Search your library and/or graveyard for a card named Vraska, Regal Gorgon?",
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
