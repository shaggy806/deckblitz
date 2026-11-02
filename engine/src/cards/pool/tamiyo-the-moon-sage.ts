import { defineCard } from "../define.js";

const TAP = "+1: Tap target permanent. It doesn't untap during its controller's next untap step.";
const DRAW = "−2: Draw a card for each tapped creature target player controls.";
const HAND = "You have no maximum hand size";
const RETURN = "Whenever a card is put into your graveyard from anywhere, you may return it to your hand.";
const ULT = `−8: You get an emblem with "${HAND}" and "${RETURN}"`;

export default defineCard({
  name: "Tamiyo, the Moon Sage",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Tamiyo"],
  loyalty: 4,
  text: `${TAP}\n${DRAW}\n${ULT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: ["permanent"],
      effect: { kind: "tap", target: 0, doesntUntapNext: true },
      resolve: null,
      text: TAP,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: ["player"],
      effect: {
        kind: "draw",
        amount: { countOf: { type: "creature", tapped: true, controlledBy: "you" }, forTarget: 0 },
      },
      resolve: null,
      text: DRAW,
    },
    {
      loyaltyCost: -8,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: `${HAND}. ${RETURN}`,
        static: { affects: { scope: "self" }, noMaxHandSize: true, text: HAND },
        triggered: [
          {
            trigger: { on: "put-into-graveyard", who: "you" },
            targets: [],
            effect: {
              kind: "may",
              prompt: "Return that card to your hand?",
              effect: { kind: "return-to-hand", target: "trigger-object", from: "graveyard" },
            },
            resolve: null,
            text: RETURN,
          },
        ],
      },
      resolve: null,
      text: ULT,
    },
  ],
});
