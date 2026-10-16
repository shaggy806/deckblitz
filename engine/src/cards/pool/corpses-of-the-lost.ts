import { defineCard } from "../define.js";

// EDHREC rank 12277. The Lost Caverns of Ixalan.
//
// Rulings:
//   [2023-11-10] You decide to pay 1 life as the last ability is resolving. If you decide to pay
//     1 life and Corpses of the Lost is still on the battlefield, it will immediately return to
//     its owner's hand. No player may take any actions in between you deciding to pay life and it
//     returning this way.
//   [2023-11-10] Abilities that begin with "At the beginning of your end step, if you descended
//     this turn" will trigger only once during your end step, no matter how many times you
//     descended this turn.
//
// Enterprising Scallywag's `turn-history` "descended" intervening "if", and
// Crossway Troublemakers' optional life payment (a `may` with `costLife`).

const ANTHEM_TEXT = "Skeletons you control get +1/+0 and have haste.";
const ENTERS_TEXT = "When this enchantment enters, create a 2/2 black Skeleton Pirate creature token.";
const END_TEXT =
  "At the beginning of your end step, if you descended this turn, you may pay 1 life. If you do, return this enchantment to its owner's hand.";

export default defineCard({
  name: "Corpses of the Lost",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${ANTHEM_TEXT}\n${ENTERS_TEXT}\n${END_TEXT} (You descended if a permanent card was put into your graveyard from anywhere.)`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Skeleton", controlledBy: "you" } },
      grantPt: [1, 0],
      grantKeywords: ["haste"],
      text: ANTHEM_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Skeleton Pirate Token", count: 1 },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-history", what: "descended" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay 1 life to return Corpses of the Lost to its owner's hand?",
        costLife: 1,
        effect: { kind: "return-to-hand", target: "source" },
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
