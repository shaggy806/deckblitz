import { defineCard } from "../define.js";

// EDHREC rank 27668. A face-down creature's mana value is 0 (the ruling).
const ENTER_TEXT =
  "When this enchantment enters, exile target creature with mana value 3 or less an opponent controls until this enchantment leaves the battlefield.";

export default defineCard({
  name: "Silkwrap",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${ENTER_TEXT} (That creature returns under its owner's control.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { type: "creature", manaValue: { op: "lte", n: 3 } } }],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
