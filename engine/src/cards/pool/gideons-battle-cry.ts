import type { EffectSpec, SearchZones } from "../../effects.js";
import { defineCard } from "../define.js";

// War of the Spark. EDHREC rank 23786.
//
// Basri's Aegis's shape: the counters, then the optional search for a named
// card in the library and/or graveyard (shuffling only when the library is
// searched). With no creatures, it still searches (its ruling).

const TEXT =
  "Put a +1/+1 counter on each creature you control. You may search your library and/or graveyard for a card named Gideon, the Oathsworn, reveal it, and put it into your hand. If you search your library this way, shuffle.";

const search = (zones: SearchZones): EffectSpec => ({
  kind: "search-library",
  filter: { name: "Gideon, the Oathsworn" },
  destination: "hand",
  reveal: true,
  min: 0,
  max: 1,
  zones,
});

export default defineCard({
  name: "Gideon's Battle Cry",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter-all", filter: { type: "creature", controlledBy: "you" }, counter: "+1/+1", amount: 1 },
      {
        kind: "may",
        prompt: "Search your library and/or graveyard for a card named Gideon, the Oathsworn?",
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
