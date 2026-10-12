import { defineCard } from "../define.js";

// EDHREC rank 12421.
//
// Icon of Ancestry's look: only a creature card with power 3 or less may be
// taken, revealed as it's taken; the rest go to the bottom in a random order.

const BEND_TEXT =
  "Waterbend {5}: Look at the top four cards of your library. You may reveal a creature card with power 3 or less from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Water Tribe Rallier",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Ally"],
  power: 2,
  toughness: 2,
  text: `${BEND_TEXT} (While paying a waterbend cost, you can tap your artifacts and creatures to help. Each one pays for {1}.)`,
  activated: [
    {
      cost: { mana: "{5}", tap: false, waterbend: true },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { type: "creature", power: { op: "lte", n: 3 } },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: BEND_TEXT,
    },
  ],
});
