import { defineCard } from "../define.js";

// Banishing Light's O-Ring shape. Rulings (2022-09-09): a token exiled this
// way ceases to exist; if Citizen's Arrest leaves before its trigger
// resolves, the target isn't exiled at all.
const EXILE_TEXT =
  "When this enchantment enters, exile target creature or planeswalker an opponent controls until this enchantment leaves the battlefield.";

export default defineCard({
  name: "Citizen's Arrest",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: EXILE_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
});
