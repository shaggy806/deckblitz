import { defineCard } from "../define.js";

// EDHREC rank 8658.
//
// Rulings:
//   [2021-04-16] When Mila’s first ability resolves, you will put a loyalty counter on all
//     planeswalkers you control, even ones that aren’t being attacked.
//   [2021-04-16] Mila’s second ability will resolve before the spell or ability that caused it to
//     trigger.
//   [2021-04-16] Mila’s first ability triggers only once no matter how many creatures are
//     attacking or how many planeswalkers are being attacked.

const ATTACKED =
  "Whenever an opponent attacks one or more planeswalkers you control, put a loyalty counter on each planeswalker you control.";
const TARGETED =
  "Whenever a permanent you control becomes the target of a spell or ability an opponent controls, you may draw a card.";

export default defineCard({
  name: "Mila, Crafty Companion",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Fox"],
  power: 2,
  toughness: 3,
  text: `${ATTACKED}\n${TARGETED}`,
  triggered: [
    {
      // Once a declaration, however many planeswalkers are attacked; every
      // planeswalker you control gets one, attacked or not (the rulings).
      trigger: { on: "attack-with", who: "opponent", attackingYourPlaneswalkers: true },
      targets: [],
      effect: { kind: "add-counter-all", filter: { type: "planeswalker", controlledBy: "you" }, counter: "loyalty", amount: 1 },
      resolve: null,
      text: ATTACKED,
    },
    {
      trigger: { on: "becomes-target", who: "you-control", byOpponentOnly: true },
      targets: [],
      effect: { kind: "may", prompt: "Draw a card?", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: TARGETED,
    },
  ],
  faces: ["Mila, Crafty Companion", "Lukka, Wayward Bonder"],
});
