import type { EffectSpec, SearchZones } from "../../effects.js";
import { defineCard } from "../define.js";

// "He's a 7/7 Dragon God creature", with no "still a planeswalker": the new
// card type replaces the old (rule 205.1a), and the planeswalker type Bahamut
// goes with it. So at seven or more counters he can't be attacked, damage only
// marks him and takes no loyalty, and his loyalty abilities still work (606.3
// says "a permanent"). "Your library and/or graveyard" is Tower Winder's shape.

const ANIMATE =
  "As long as Grand Master of Flowers has seven or more loyalty counters on him, he's a 7/7 Dragon God creature with flying and indestructible.";
const RESTRICT = "+1: Target creature without first strike, double strike, or vigilance can't attack or block until your next turn.";
const SEARCH =
  "+1: Search your library and/or graveyard for a card named Monk of the Open Hand, reveal it, and put it into your hand. If you search your library this way, shuffle.";

const search = (zones: SearchZones): EffectSpec => ({
  kind: "search-library",
  filter: { name: "Monk of the Open Hand" },
  destination: "hand",
  reveal: true,
  min: 0,
  max: 1,
  zones,
});

export default defineCard({
  name: "Grand Master of Flowers",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Bahamut"],
  loyalty: 3,
  text: `${ANIMATE}\n${RESTRICT}\n${SEARCH}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "self-counters", counter: "loyalty", compare: { op: "gte", n: 7 } },
      setTypes: ["creature"],
      addSubtypes: ["Dragon", "God"],
      setBasePt: { power: 7, toughness: 7 },
      grantKeywords: ["flying", "indestructible"],
      text: ANIMATE,
    },
  ],
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [
        {
          kind: "permanent",
          filter: {
            type: "creature",
            not: { anyOf: [{ keyword: "first-strike" }, { keyword: "double-strike" }, { keyword: "vigilance" }] },
          },
        },
      ],
      effect: {
        kind: "restrict",
        target: 0,
        restrictions: ["cant-attack", "cant-block"],
        duration: "until-your-next-turn",
      },
      resolve: null,
      text: RESTRICT,
    },
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
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
  ],
});
