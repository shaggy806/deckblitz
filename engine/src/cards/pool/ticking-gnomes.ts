import { defineCard } from "../define.js";

// EDHREC rank 28630.

const ECHO_TEXT =
  "Echo {3} (At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)";

export default defineCard({
  name: "Ticking Gnomes",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Gnome"],
  power: 3,
  toughness: 3,
  text: `${ECHO_TEXT}\nSacrifice this creature: It deals 1 damage to any target.`,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "Sacrifice this creature: It deals 1 damage to any target.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "source-came-under-control-since-last-upkeep" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ pay: "{3}", text: "Pay {3}" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: ECHO_TEXT,
    },
  ],
});
