import { defineCard } from "../define.js";

// EDHREC rank 26735. Trapped in the Screen's shape.
//
// Rulings:
//   [2016-01-22] If Isolation Zone leaves the battlefield before its triggered ability resolves,
//     the target creature or enchantment won't be exiled.
//   [2016-01-22] If a token is exiled, it ceases to exist. It won't be returned to the
//     battlefield.
//   [2016-01-22] The exiled card returns to the battlefield immediately after Isolation Zone
//     leaves the battlefield. Nothing happens between the two events, including state-based
//     actions.

const TEXT =
  "When this enchantment enters, exile target creature or enchantment an opponent controls until this enchantment leaves the battlefield.";

export default defineCard({
  name: "Isolation Zone",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${TEXT} (That permanent returns under its owner's control.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["creature", "enchantment"] } }],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
