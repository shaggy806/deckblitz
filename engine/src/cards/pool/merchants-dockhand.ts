import { defineCard } from "../define.js";

// X is the number of artifacts tapped for the cost, this one never among them
// (the ruling); at X = 0 nothing is looked at.

const LOOK_TEXT =
  "{3}{U}, {T}, Tap X untapped artifacts you control: Look at the top X cards of your library. Put one of them into your hand and the rest on the bottom of your library in any order.";

export default defineCard({
  name: "Merchant's Dockhand",
  manaCost: "{1}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 1,
  toughness: 2,
  text: LOOK_TEXT,
  activated: [
    {
      cost: { mana: "{3}{U}", tap: true, tapOthers: { count: "x", filter: { type: "artifact", controlledBy: "you" } } },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: "x",
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "bottom-any-order",
      },
      resolve: null,
      text: LOOK_TEXT,
    },
  ],
});
