import { defineCard } from "../define.js";

// Modern Horizons 3.
//
// - "Hexproof from activated and triggered abilities" (rule 702.11d): no activated or triggered
//   ability an opponent controls can target it — `hexproofFrom: { abilitiesOnly: true }` (static
//   abilities never target, rule 115.1). A hexproof ability, so an effect that makes it lose hexproof
//   takes it (702.11e).
// - The enters trigger: `exchange-control` of this and the target; `then` is "if you do" — four
//   energy, then a `may` paying energy equal to that creature's mana value, `else` sacrificing it.

const HEXPROOF_TEXT = "Hexproof from activated and triggered abilities";
const ENTERS_TEXT =
  "When this creature enters, exchange control of this creature and target creature an opponent controls. If you do, you get {E}{E}{E}{E}, then sacrifice that creature unless you pay an amount of {E} equal to its mana value.";

export default defineCard({
  name: "Volatile Stormdrake",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Drake"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying, hexproof from activated and triggered abilities\n${ENTERS_TEXT}`,
  static: [{ affects: { scope: "self" }, hexproofFrom: { abilitiesOnly: true }, text: HEXPROOF_TEXT }],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "exchange-control",
        objects: ["source", 0],
        then: {
          kind: "sequence",
          effects: [
            { kind: "get-energy", amount: 4 },
            {
              kind: "may",
              prompt: "Pay {E} equal to that creature's mana value to keep it?",
              costEnergy: { manaValueOf: 0 },
              effect: { kind: "sequence", effects: [] },
              else: { kind: "sacrifice-target", target: 0 },
            },
          ],
        },
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
