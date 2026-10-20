import { defineCard } from "../define.js";

// EDHREC rank 14650.
//
// Rulings:
//   [2025-04-04] If a token is exiled this way, it will cease to exist and won't return to the
//     battlefield.
//   [2025-04-04] If this enchantment leaves the battlefield before its ability resolves, the
//     target nonland permanent won't be exiled.

const ETB_TEXT =
  "When this enchantment enters, exile target nonland permanent an opponent controls until this enchantment leaves the battlefield.";

export default defineCard({
  name: "Stormplain Detainment",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: ETB_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["nonland-permanent-an-opponent-controls"],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
