import { defineCard } from "../define.js";

// EDHREC rank 8986.
//
// Rulings:
//   [2024-09-20] If a token is exiled this way, it will cease to exist and won't return to the
//     battlefield.
//   [2024-09-20] Auras attached to the exiled permanent will be put into their owners' graveyards.
//     Any Equipment will become unattached and remain on the battlefield. Any counters on the
//     exiled permanent will cease to exist. When the card returns to the battlefield, it will be a
//     new object with no connection to the card that was exiled.
//   [2024-09-20] If Trapped in the Screen leaves the battlefield before its last ability resolves,
//     the target permanent won't be exiled at all.

const WARD =
  "Ward {2} (Whenever this enchantment becomes the target of a spell or ability an opponent controls, counter it unless that player pays {2}.)";
const ENTER =
  "When this enchantment enters, exile target artifact, creature, or enchantment an opponent controls until this enchantment leaves the battlefield.";

export default defineCard({
  name: "Trapped in the Screen",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${WARD}\n${ENTER}`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { mana: "{2}" } },
      resolve: null,
      text: "Ward {2}",
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        { kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["artifact", "creature", "enchantment"] } },
      ],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: ENTER,
    },
    {
      // The "until" half: the card comes back as this leaves (Banishing
      // Light's shape).
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source" },
      resolve: null,
      text: "When this enchantment leaves the battlefield, return the exiled card.",
    },
  ],
});
