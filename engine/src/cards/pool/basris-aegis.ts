import type { EffectSpec, SearchZones } from "../../effects.js";
import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// Up to two distinct target creatures, then Raven Clan War-Axe's optional
// search for a named card. Cast with no targets, it just searches; with
// targets that have all become illegal, it doesn't resolve at all, and one
// still legal is enough for both halves (its rulings — rule 608.2b).

const TEXT =
  "Put a +1/+1 counter on each of up to two target creatures. You may search your library and/or graveyard for a card named Basri, Devoted Paladin, reveal it, and put it into your hand. If you search your library this way, shuffle.";

const search = (zones: SearchZones): EffectSpec => ({
  kind: "search-library",
  filter: { name: "Basri, Devoted Paladin" },
  destination: "hand",
  reveal: true,
  min: 0,
  max: 1,
  zones,
});

export default defineCard({
  name: "Basri's Aegis",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: TEXT,
  targets: distinctTargets(2, "creature", { optional: true }),
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
      {
        kind: "may",
        prompt: "Search your library and/or graveyard for a card named Basri, Devoted Paladin?",
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
