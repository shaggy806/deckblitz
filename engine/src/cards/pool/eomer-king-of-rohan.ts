import { defineCard } from "../define.js";

// EDHREC rank 4829.
//
// Rulings:
//   [2023-06-23] The game starts with no monarch. Once an effect makes one player the monarch,
//     the game will have exactly one monarch from that point forward.
//
// The counters are a replacement as it enters (Squad Captain's count, other
// Humans only); the trigger makes the target player the monarch
// (`become-monarch`'s `who` slot — Denethor) and deals damage equal to
// Éomer's power as it resolves.
const ENTER_TEXT = "Éomer enters with a +1/+1 counter on it for each other Human you control.";
const TRIGGER_TEXT =
  "When Éomer enters, target player becomes the monarch. Éomer deals damage equal to its power to any target.";

export default defineCard({
  name: "Éomer, King of Rohan",
  manaCost: "{3}{R}{W}",
  colors: ["R", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Noble"],
  power: 2,
  toughness: 2,
  keywords: ["double-strike"],
  text: `Double strike\n${ENTER_TEXT}\n${TRIGGER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { countOf: { subtype: "Human", controlledBy: "you" }, excludeSelf: true } },
      },
      text: ENTER_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player", "any-target"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "become-monarch", who: 0 },
          { kind: "damage", amount: { powerOf: "source" }, target: 1 },
        ],
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
