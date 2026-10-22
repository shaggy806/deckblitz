import { defineCard } from "../define.js";

// EDHREC rank 18319.
//
// Temporary Lockdown's `exile-all` with `untilSourceLeaves` (rule 610.3):
// nothing is exiled if the enchantment has already left (610.3a), tokens
// cease to exist in exile, and every card comes back at once.
//
// Rulings:
//   [2017-02-09] If an artifact token is exiled, it ceases to exist. It won't be returned to the
//     battlefield.
//   [2017-02-09] The exiled cards return to the battlefield immediately after Consulate Crackdown
//     leaves the battlefield. If Consulate Crackdown exiles multiple artifacts, those cards all
//     return to the battlefield at the same time.
//   [2017-02-09] If Consulate Crackdown leaves the battlefield before its triggered ability
//     resolves, no artifacts will be exiled.

const ETB_TEXT =
  "When this enchantment enters, exile all artifacts your opponents control until this enchantment leaves the battlefield.";

export default defineCard({
  name: "Consulate Crackdown",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: ETB_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "exile-all", filter: { type: "artifact", controlledBy: "opponent" }, untilSourceLeaves: true },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
