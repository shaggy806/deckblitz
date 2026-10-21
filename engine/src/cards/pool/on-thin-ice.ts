import { defineCard } from "../define.js";

// EDHREC rank 9604.
//
// Rulings:
//   [2019-06-14] If On Thin Ice leaves the battlefield before its triggered ability resolves, the
//     target creature won't be exiled.
//   [2019-06-14] If a token is exiled this way, it will cease to exist and won't return to the
//     battlefield.

const EXILE_TEXT = "When this Aura enters, exile target creature an opponent controls until this Aura leaves the battlefield.";

export default defineCard({
  name: "On Thin Ice",
  manaCost: "{W}",
  colors: ["W"],
  supertypes: ["snow"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant snow land you control\n${EXILE_TEXT}`,
  targets: [{ kind: "permanent", whose: "you", filter: { type: "land", supertype: "snow" } }],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
});
