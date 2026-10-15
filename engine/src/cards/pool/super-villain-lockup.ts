import { defineCard } from "../define.js";

const ENTERS_TEXT =
  "When this enchantment enters, exile target tapped creature an opponent controls until this enchantment leaves the battlefield.";

export default defineCard({
  name: "Super Villain Lockup",
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
    {
      // The O-Ring's other half (rule 610.3): the exile's linked return.
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source" },
      resolve: null,
      text: "When this enchantment leaves the battlefield, return the exiled card.",
    },
  ],
});
