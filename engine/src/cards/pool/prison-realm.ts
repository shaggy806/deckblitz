import { defineCard } from "../define.js";

const EXILE_TEXT =
  "When this enchantment enters, exile target creature or planeswalker an opponent controls until this enchantment leaves the battlefield.";
const SCRY_TEXT = "When this enchantment enters, scry 1.";

// Two separate triggers: you scry 1 even if the exile has no legal target
// (the ruling).
export default defineCard({
  name: "Prison Realm",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${EXILE_TEXT}\n${SCRY_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: EXILE_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "scry", amount: 1 },
      resolve: null,
      text: SCRY_TEXT,
    },
  ],
});
