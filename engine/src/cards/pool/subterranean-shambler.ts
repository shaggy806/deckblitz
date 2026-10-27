import { defineCard } from "../define.js";

// EDHREC rank 31278.

const TEXT = "When this creature enters or leaves the battlefield, it deals 1 damage to each creature without flying.";
const PING = { kind: "damage-all", filter: { type: "creature", notKeyword: "flying" }, amount: 1 } as const;

export default defineCard({
  name: "Subterranean Shambler",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 2,
  toughness: 3,
  text: `Echo {3}{R} (At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "source-came-under-control-since-last-upkeep" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ pay: "{3}{R}", text: "Pay {3}{R}" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: "Echo {3}{R} (At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)",
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: PING,
      resolve: null,
      text: TEXT,
    },
    {
      // The creature as it last existed deals the damage (rule 603.10a).
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: PING,
      resolve: null,
      text: TEXT,
    },
  ],
});
