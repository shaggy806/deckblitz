import type { EffectSpec, SearchZones } from "../../effects.js";
import { defineCard } from "../define.js";

// Amonkhet. EDHREC rank 14825.
//
// Gideon's Battle Cry's shape: the counters, then the optional search for a
// named card in the library and/or graveyard (shuffling only when the library
// is searched).

const TEXT =
  "Put a -1/-1 counter on each creature you don't control. You may search your library and/or graveyard for a card named Liliana, Death Wielder, reveal it, and put it into your hand. If you search your library this way, shuffle.";

const search = (zones: SearchZones): EffectSpec => ({
  kind: "search-library",
  filter: { name: "Liliana, Death Wielder" },
  destination: "hand",
  reveal: true,
  min: 0,
  max: 1,
  zones,
});

export default defineCard({
  name: "Liliana's Influence",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter-all", filter: { type: "creature", controlledBy: "opponent" }, counter: "-1/-1", amount: 1 },
      {
        kind: "may",
        prompt: "Search your library and/or graveyard for a card named Liliana, Death Wielder?",
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
