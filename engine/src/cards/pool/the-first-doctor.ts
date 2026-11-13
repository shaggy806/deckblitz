import type { EffectSpec, SearchZones } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 13037. Doctor Who. The TARDIS search is Tower Winder's ("and/or"
// as three modes, a library search shuffling); the cascade trigger is
// `cast-spell`'s `spellHas: "cascade"` (Aurora Phoenix), its target chosen
// before cascade reveals anything (the ruling).
const SEARCH =
  "When The First Doctor enters, search your library and/or graveyard for a card named TARDIS, reveal it, and put it into your hand. If you search your library this way, shuffle.";
const CASCADE = "Whenever you cast a spell with cascade, put a +1/+1 counter on target artifact or creature.";

const search = (zones: SearchZones): EffectSpec => ({
  kind: "search-library",
  filter: { name: "TARDIS" },
  destination: "hand",
  reveal: true,
  min: 0,
  max: 1,
  zones,
});

export default defineCard({
  name: "The First Doctor",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Time Lord", "Doctor"],
  power: 2,
  toughness: 2,
  text: `${SEARCH}\n${CASCADE}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
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
      resolve: null,
      text: SEARCH,
    },
    {
      trigger: { on: "cast-spell", who: "you", spellHas: "cascade" },
      targets: ["artifact-or-creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: CASCADE,
    },
  ],
});
