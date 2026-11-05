import { defineCard } from "../define.js";

// EDHREC rank 19284. X is the number of eyeball counters the cost removed.
const DIES_TEXT = "Whenever a creature you control dies, put two eyeball counters on this artifact.";
const LOOK_TEXT =
  "{3}, {T}, Remove all eyeball counters from this artifact: Look at the top X cards of your library, where X is the number of eyeball counters removed this way. Put one of them into your hand and the rest on the bottom of your library in any order.";

export default defineCard({
  name: "Jar of Eyeballs",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${DIES_TEXT}\n${LOOK_TEXT}`,
  activated: [
    {
      cost: { mana: "{3}", tap: true, removeCounter: { kind: "eyeball", count: "all" } },
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
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "eyeball", amount: 2 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
