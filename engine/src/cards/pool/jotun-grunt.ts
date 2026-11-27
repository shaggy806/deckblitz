import { defineCard } from "../define.js";
import { cumulativeUpkeep } from "../helpers.js";

// EDHREC rank 25089.
//
// Each age counter's two cards are chosen on their own, from whichever single
// graveyard (its ruling; rule 702.24a), and it's all of it or none: offered
// only while the graveyards hold that many pairs.

const upkeep = cumulativeUpkeep({
  doing: {
    kind: "look-and-choose",
    zone: "graveyards",
    min: 2,
    max: 2,
    together: { singleGraveyard: true },
    destination: "library-bottom",
    leftover: "stay",
    prompt: "Put two cards from a single graveyard on the bottom of their owner's library",
  },
  text: "Put two cards from a single graveyard on the bottom of their owner's library",
});

export default defineCard({
  name: "Jötun Grunt",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Giant", "Soldier"],
  power: 4,
  toughness: 4,
  text: upkeep.text,
  triggered: [upkeep],
});
