import { defineCard } from "../define.js";

// Each Sliver's own ability, so the card comes back as *that* Sliver leaves
// (rule 610.3 — `untilSourceLeaves`, a one-shot return): it doesn't hang on
// Constricting Sliver staying, nor on the Sliver keeping the ability.
const GRANTED_TEXT =
  "When this creature enters, you may exile target creature an opponent controls until this creature leaves the battlefield.";

export default defineCard({
  name: "Constricting Sliver",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 3,
  toughness: 3,
  text: `Sliver creatures you control have "${GRANTED_TEXT}"`,
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Sliver" },
      grantsTriggered: [
        {
          trigger: { on: "enters-battlefield", who: "self" },
          targets: ["creature-an-opponent-controls"],
          effect: {
            kind: "may",
            prompt: "Exile the targeted creature until this creature leaves the battlefield?",
            effect: { kind: "exile", target: 0, untilSourceLeaves: true },
          },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: `Sliver creatures you control have "${GRANTED_TEXT}"`,
    },
  ],
});
