import { defineCard } from "../define.js";

// EDHREC rank 12468.
//
// Partner with (rule 702.124j): the pair's search trigger. The goad ability
// is Bloodboil Sorcerer's, for {2}.
const PARTNER_TEXT =
  "Partner with Kamber, the Plunderer (When this creature enters, target player may put Kamber into their hand from their library, then shuffle.)";
const GOAD_TEXT = "{2}, Sacrifice an artifact or creature: Goad target creature.";

export default defineCard({
  name: "Laurine, the Diversion",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 3,
  toughness: 3,
  keywords: ["first-strike"],
  pairing: { kind: "partner-with", name: "Kamber, the Plunderer" },
  text: `${PARTNER_TEXT}\nFirst strike\n${GOAD_TEXT} (Until your next turn, that creature attacks each combat if able and attacks a player other than you if able.)`,
  activated: [
    {
      cost: {
        mana: "{2}",
        tap: false,
        sacrifice: { filter: { typesAnyOf: ["artifact", "creature"] } },
      },
      targets: ["creature"],
      effect: { kind: "goad", target: 0 },
      resolve: null,
      text: GOAD_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "each-player-may",
        who: { controllerOfTarget: 0 },
        prompt: "Search your library for a card named Kamber, the Plunderer?",
        effect: {
          kind: "search-library",
          filter: { name: "Kamber, the Plunderer" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: "When this creature enters, target player may search their library for a card named Kamber, the Plunderer, reveal it, put it into their hand, then shuffle.",
    },
  ],
});
