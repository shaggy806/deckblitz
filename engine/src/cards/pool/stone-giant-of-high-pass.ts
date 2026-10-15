import { defineCard } from "../define.js";

// EDHREC rank 21686.
// Makes Stone Boulder → "Stone Boulder Token" (named Stone Boulder by its `tokenName`).

const TOKEN_TEXT =
  "Whenever this creature enters or attacks, create a 3/1 colorless Wall artifact creature token with defender named Stone Boulder.";
const SAC_TEXT = "{2}{R}, Sacrifice an artifact: This creature deals 4 damage to any target.";

export default defineCard({
  name: "Stone-Giant of High Pass",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant"],
  power: 7,
  toughness: 7,
  text: `${TOKEN_TEXT}\n${SAC_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false, sacrifice: { filter: { type: "artifact" } } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 4, target: 0 },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Stone Boulder Token", count: 1 },
      resolve: null,
      text: TOKEN_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Stone Boulder Token", count: 1 },
      resolve: null,
      text: TOKEN_TEXT,
    },
  ],
});
