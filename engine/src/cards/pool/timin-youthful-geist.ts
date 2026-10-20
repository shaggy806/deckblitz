import { defineCard } from "../define.js";

// EDHREC rank 10226.
//
// Partner with (rule 702.124j): the pair's search trigger. "Each combat" is
// every player's beginning of combat.
const PARTNER_TEXT =
  "Partner with Rhoda, Geist Avenger (When this creature enters, target player may put Rhoda into their hand from their library, then shuffle.)";
const COMBAT_TEXT = "At the beginning of each combat, tap up to one target creature.";

export default defineCard({
  name: "Timin, Youthful Geist",
  manaCost: "{4}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  pairing: { kind: "partner-with", name: "Rhoda, Geist Avenger" },
  text: `${PARTNER_TEXT}\nFlying\n${COMBAT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "each-player-may",
        who: { controllerOfTarget: 0 },
        prompt: "Search your library for a card named Rhoda, Geist Avenger?",
        effect: {
          kind: "search-library",
          filter: { name: "Rhoda, Geist Avenger" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: "When this creature enters, target player may search their library for a card named Rhoda, Geist Avenger, reveal it, put it into their hand, then shuffle.",
    },
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "any" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
