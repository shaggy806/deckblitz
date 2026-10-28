import { defineCard } from "../define.js";

// EDHREC rank 2293.
//
// The stash counter is part of the first mana ability (`also`, Vulshok
// Factory's shape); X is read off the sacrificed artifact as it last existed
// (rule 608.2h), as Lotus Blossom's is.
const TAP_TEXT = "{T}: Add {R}. Put a stash counter on this artifact.";
const SAC_TEXT =
  "{T}, Sacrifice this artifact: Add X mana of any one color, where X is the number of stash counters on this artifact.";

export default defineCard({
  name: "Glittering Stockpile",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Treasure"],
  text: `${TAP_TEXT}\n${SAC_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "R",
        amount: 1,
        also: { kind: "add-counter", target: "source", counter: "stash", amount: 1 },
      },
      resolve: null,
      text: TAP_TEXT,
    },
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: { countersOn: "source", counter: "stash" } },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
