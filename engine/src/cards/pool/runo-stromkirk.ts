import { defineCard } from "../define.js";

// The upkeep trigger looks at the top card privately; revealing it only does
// anything when it's a creature card with mana value 6 or greater, so the
// reveal is offered as a choice of that card (`reveal: "chosen"`), which stays
// on top, and choosing it transforms Runo. Revealing any other card has no
// effect the card cares about.
const ETB_TEXT =
  "When Runo enters, put up to one target creature card from your graveyard on top of your library.";
const UPKEEP_TEXT =
  "At the beginning of your upkeep, look at the top card of your library. You may reveal that card. If a creature card with mana value 6 or greater is revealed this way, transform Runo.";

export default defineCard({
  name: "Runo Stromkirk",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire", "Cleric"],
  power: 1,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${ETB_TEXT}\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        { kind: "optional", of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } } },
      ],
      effect: { kind: "put-on-library", target: 0, position: "top" },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { type: "creature", manaValue: { op: "gte", n: 6 } },
        destination: "library-top",
        leftover: "stay",
        then: { kind: "transform", target: "source" },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  faces: ["Runo Stromkirk", "Krothuss, Lord of the Deep"],
  transform: true,
});
