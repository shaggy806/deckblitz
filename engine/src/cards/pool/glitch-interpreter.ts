import { defineCard } from "../define.js";

// EDHREC rank 10336.
//
// Rulings:
//   [2024-09-20] Glitch Interpreter's first ability won't trigger at all if you control one or
//     more face-down permanents when it enters. If it does trigger but you somehow control one or
//     more face-down permanents when it resolves, the ability won't do anything. You won't return
//     Glitch Interpreter to your hand, and you won't manifest dread.
//   [2024-09-20] If Glitch Interpreter is no longer on the battlefield when its first ability
//     resolves and you control no face-down permanents, you'll still manifest dread.
//
// The "if" is an intervening one (rule 603.4), asked as it enters and again
// as it resolves. A face-down permanent is colorless (rule 708.2a), so the
// manifested creatures count for the draw — once for each player the batch
// damaged (Locker Room's shape).
const ENTERS =
  "When this creature enters, if you control no face-down permanents, return this creature to its owner's hand and manifest dread.";
const DRAW = "Whenever one or more colorless creatures you control deal combat damage to a player, draw a card.";

export default defineCard({
  name: "Glitch Interpreter",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 3,
  text: `${ENTERS}\n${DRAW}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "not", of: { kind: "controls", filter: { faceDown: true }, atLeast: 1 } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "return-to-hand", target: "source" }, { kind: "manifest-dread" }],
      },
      resolve: null,
      text: ENTERS,
    },
    {
      trigger: {
        on: "deals-damage-batch",
        who: "you-control",
        filter: { type: "creature", colorless: true },
        combat: true,
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW,
    },
  ],
});
