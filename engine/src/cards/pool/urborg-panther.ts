import { defineCard } from "../define.js";

// Mirage.
//
// "Destroy target creature blocking it" is Tinder Wall's read: the Panther is
// sacrificed as the cost, so "blocking it" is read off its last-known
// information (rules 608.2b, 608.2h). "Sacrifice a creature named Feral
// Shadow, a creature named Breathstealer, and this creature" is The Book of
// Vile Darkness's `sacrifice.each`: one permanent for each filter, all at once.

const BLOCKER = "{B}, Sacrifice this creature: Destroy target creature blocking it.";
const SPIRIT =
  "Sacrifice a creature named Feral Shadow, a creature named Breathstealer, and this creature: Search your library for a card named Spirit of the Night, put that card onto the battlefield, then shuffle.";

export default defineCard({
  name: "Urborg Panther",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Nightstalker", "Cat"],
  power: 2,
  toughness: 2,
  text: `${BLOCKER}\n${SPIRIT}`,
  activated: [
    {
      cost: { mana: "{B}", tap: false, sacrifice: "self" },
      targets: [{ kind: "permanent", filter: { type: "creature", blockingRelation: { relation: "blocking" } } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: BLOCKER,
    },
    {
      cost: {
        mana: null,
        tap: false,
        sacrifice: {
          each: [
            { type: "creature", hasName: "Feral Shadow" },
            { type: "creature", hasName: "Breathstealer" },
            { isSource: true },
          ],
        },
      },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { name: "Spirit of the Night" },
        destination: "battlefield",
        min: 0,
        max: 1,
        zones: "library",
      },
      resolve: null,
      text: SPIRIT,
    },
  ],
});
