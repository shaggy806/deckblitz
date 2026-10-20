import { defineCard } from "../define.js";

// EDHREC rank 9532.
//
// Rulings:
//   [2023-04-14] If a token is exiled, it ceases to exist. It won't be returned to the
//     battlefield.
//   [2023-04-14] If Seal from Existence leaves the battlefield before its last ability resolves,
//     the target permanent won't be exiled.
//
// Banishing Light's shape (`untilSourceLeaves`), plus ward {3}.

const EXILE_TEXT =
  "When this enchantment enters, exile target nonland permanent an opponent controls until this enchantment leaves the battlefield.";

export default defineCard({
  name: "Seal from Existence",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `Ward {3} (Whenever this enchantment becomes the target of a spell or ability an opponent controls, counter it unless that player pays {3}.)\n${EXILE_TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { mana: "{3}" } },
      resolve: null,
      text: "Ward {3}",
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["nonland-permanent-an-opponent-controls"],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
});
