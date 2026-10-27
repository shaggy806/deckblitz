import { defineCard } from "../define.js";

// EDHREC rank 22166.
//
// Each mode sets up a delayed "whenever" ability for the rest of the turn
// (Green Dragon's and Banewasp Affliction's shapes); entwine is
// `kicker.keyword` with `kickedModes`.

const DAMAGE_TEXT = "Until end of turn, whenever a creature is dealt damage, destroy it.";
const DIES_TEXT =
  "Until end of turn, whenever a creature dies, that creature's controller loses life equal to its toughness.";

export default defineCard({
  name: "Shriveling Rot",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  kicker: { cost: "{2}{B}", keyword: "entwine" },
  text: "Choose one —\n• Until end of turn, whenever a creature is dealt damage, destroy it.\n• Until end of turn, whenever a creature dies, that creature's controller loses life equal to its toughness.\nEntwine {2}{B} (Choose both if you pay the entwine cost.)",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: DAMAGE_TEXT,
        targets: [],
        effect: {
          kind: "delayed-trigger",
          at: { whenever: { on: "dealt-damage", who: "any", filter: { type: "creature" } } },
          effect: { kind: "destroy", target: "trigger-object" },
          text: "Whenever a creature is dealt damage this turn, destroy it.",
        },
      },
      {
        text: DIES_TEXT,
        targets: [],
        effect: {
          kind: "delayed-trigger",
          at: { whenever: { on: "dies", who: "any", filter: { type: "creature" } } },
          effect: {
            kind: "lose-life",
            amount: { toughnessOf: "trigger-object" },
            who: "trigger-controller",
          },
          text: "Whenever a creature dies this turn, that creature's controller loses life equal to its toughness.",
        },
      },
    ],
    kickedModes: 2,
  },
});
