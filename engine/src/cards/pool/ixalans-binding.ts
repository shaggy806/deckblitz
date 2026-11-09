import { defineCard } from "../define.js";

const ENTERS_TEXT =
  "When this enchantment enters, exile target nonland permanent an opponent controls until this enchantment leaves the battlefield.";
const LOCK_TEXT = "Your opponents can't cast spells with the same name as the exiled card.";

// Banishing Light's exile; the lock reads the card it exiled until it leaves
// as "the exiled card" (`sameNameWith: "exiled-with-source"`, rule 607.2a).
export default defineCard({
  name: "Ixalan's Binding",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${ENTERS_TEXT}\n${LOCK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["nonland-permanent-an-opponent-controls"],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      prohibits: [{ act: "cast", who: "opponents", filter: { sameNameWith: "exiled-with-source" } }],
      text: LOCK_TEXT,
    },
  ],
});
