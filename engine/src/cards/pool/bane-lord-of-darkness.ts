import { defineCard } from "../define.js";

const INDESTRUCTIBLE_TEXT =
  "As long as your life total is less than or equal to half your starting life total, Bane has indestructible.";
const DIES_TEXT =
  "Whenever another nontoken creature you control dies, target opponent may have you draw a card. If they don't, you may put a creature card with equal or lesser toughness from your hand onto the battlefield.";

// The toughness compared is the creature that died's, as it last existed on
// the battlefield — not Bane's (its ruling).
export default defineCard({
  name: "Bane, Lord of Darkness",
  manaCost: "{1}{W}{U}{B}",
  colors: ["W", "U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["God"],
  power: 5,
  toughness: 2,
  text: `${INDESTRUCTIBLE_TEXT}\n${DIES_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "life-total", atMost: "half-starting" },
      grantKeywords: ["indestructible"],
      text: INDESTRUCTIBLE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", otherOnly: true, filter: { type: "creature", token: false } },
      targets: ["opponent"],
      effect: {
        kind: "each-player-may",
        who: { controllerOfTarget: 0 },
        choices: [
          { text: "Have them draw a card.", effect: { kind: "draw", amount: 1 } },
          {
            text: "They may put a creature card with equal or lesser toughness from their hand onto the battlefield.",
            effect: {
              kind: "look-and-choose",
              zone: "hand",
              min: 0,
              max: 1,
              destination: "battlefield",
              leftover: "stay",
              filter: {
                type: "creature",
                toughness: { op: "lte", n: { amount: { toughnessOf: "trigger-object" } } },
              },
            },
          },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
