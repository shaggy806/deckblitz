import { defineCard } from "../define.js";

const FOOD_TEXT = "Whenever The Bearded Teakeeper enters or attacks, create a Food token.";
const SCALD_TEXT = "Scald — {2}, {T}, Sacrifice this artifact: It deals 2 damage to target opponent.";
const GRANT_TEXT = `Foods you control have "${SCALD_TEXT}"`;

export default defineCard({
  name: "The Bearded Teakeeper",
  manaCost: "{2}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 4,
  toughness: 4,
  text: `${FOOD_TEXT}\n${GRANT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 1 },
      resolve: null,
      text: FOOD_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 1 },
      resolve: null,
      text: FOOD_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Food", controlledBy: "you" } },
      grantsActivated: [
        {
          cost: { mana: "{2}", tap: true, sacrifice: "self" },
          targets: ["opponent"],
          effect: { kind: "damage", amount: 2, target: 0 },
          resolve: null,
          text: SCALD_TEXT,
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
