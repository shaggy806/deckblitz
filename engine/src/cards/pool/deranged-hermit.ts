import { defineCard } from "../define.js";

// Rulings:
//   The Squirrel tokens get the bonus, so they are effectively 2/2 creatures until the Hermit
//   leaves the battlefield. And they get bigger if multiple Hermits are on the battlefield.

export default defineCard({
  name: "Deranged Hermit",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf"],
  power: 1,
  toughness: 1,
  text: "Echo {3}{G}{G} (At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)\nWhen this creature enters, create four 1/1 green Squirrel creature tokens.\nSquirrel creatures get +1/+1.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "source-came-under-control-since-last-upkeep" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ pay: "{3}{G}{G}", text: "Pay {3}{G}{G}" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: "Echo {3}{G}{G} (At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)",
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Squirrel Token", count: 4 },
      resolve: null,
      text: "When this creature enters, create four 1/1 green Squirrel creature tokens.",
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Squirrel" } },
      grantPt: [1, 1],
      text: "Squirrel creatures get +1/+1.",
    },
  ],
});
