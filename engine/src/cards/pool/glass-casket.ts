import { defineCard } from "../define.js";

// EDHREC rank 18233.
//
// Rulings:
//   [2019-10-04] If a token is exiled this way, it will cease to exist and won't return to the
//     battlefield.
//   [2019-10-04] If Glass Casket leaves the battlefield before its triggered ability resolves, the
//     target creature won't be exiled.

const TEXT =
  "When this artifact enters, exile target creature an opponent controls with mana value 3 or less until this artifact leaves the battlefield.";

export default defineCard({
  name: "Glass Casket",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { type: "creature", manaValue: { op: "lte", n: 3 } } }],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
