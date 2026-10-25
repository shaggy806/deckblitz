import { defineCard } from "../define.js";

const ETB_TEXT =
  "When this enchantment enters, exile target creature an opponent controls until this enchantment leaves the battlefield.";

export default defineCard({
  name: "Stasis Snare",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  keywords: ["flash"],
  text: `Flash (You may cast this spell any time you could cast an instant.)\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
