import { defineCard } from "../define.js";

// EDHREC rank 31320.

const STATIC_TEXT = "Enchanted creature can't be blocked by Spirits.";
const RETURN_TEXT = "{1}{U}: Return this Aura to its owner's hand.";

export default defineCard({
  name: "Field of Reality",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${STATIC_TEXT}\n${RETURN_TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, cantBeBlockedBy: { subtype: "Spirit" }, text: STATIC_TEXT }],
  activated: [
    {
      cost: { mana: "{1}{U}", tap: false },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
