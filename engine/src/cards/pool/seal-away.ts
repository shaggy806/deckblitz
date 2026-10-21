import { defineCard } from "../define.js";

// EDHREC rank 16403.

const ENTERS_TEXT =
  "When this enchantment enters, exile target tapped creature an opponent controls until this enchantment leaves the battlefield.";

export default defineCard({
  name: "Seal Away",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  keywords: ["flash"],
  text: `Flash\n${ENTERS_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { type: "creature", tapped: true } }],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
