import { defineCard } from "../define.js";

// EDHREC rank 16087.
//
// Rulings:
//   [2022-06-10] If Bhaal, Lord of Murder is dealt lethal damage at the same time that its
//     controller's life total is reduced to less than or equal to half their starting life total,
//     Bhaal will have indestructible at the time state-based actions are performed and survive.

const INDESTRUCTIBLE_TEXT =
  "As long as your life total is less than or equal to half your starting life total, Bhaal has indestructible.";
const DIES_TEXT =
  "Whenever another nontoken creature you control dies, put a +1/+1 counter on target creature and goad it.";

export default defineCard({
  name: "Bhaal, Lord of Murder",
  manaCost: "{2}{B}{R}{G}",
  colors: ["B", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["God"],
  power: 4,
  toughness: 4,
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
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { token: false, type: "creature" },
        otherOnly: true,
      },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "goad", target: 0 },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
