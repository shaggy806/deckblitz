import { defineCard } from "../define.js";

// EDHREC rank 29960.
//
// Rulings:
//   [2017-07-14] Having more than one Desert doesn't matter.
//   [2017-07-14] One condition must be true as the ability triggers and one as it resolves; they
//     needn't be the same one (an intervening-if over an `any`, checked both times).

export default defineCard({
  name: "Unquenchable Thirst",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nWhen this Aura enters, if you control a Desert or there is a Desert card in your graveyard, tap enchanted creature.\nEnchanted creature doesn't untap during its controller's untap step.",
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: {
        kind: "any",
        of: [
          { kind: "controls", filter: { subtype: "Desert" }, atLeast: 1 },
          { kind: "cards-in-graveyard", atLeast: 1, filter: { subtype: "Desert" } },
        ],
      },
      targets: [],
      effect: { kind: "tap", target: "attached" },
      resolve: null,
      text: "When this Aura enters, if you control a Desert or there is a Desert card in your graveyard, tap enchanted creature.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["doesnt-untap"],
      text: "Enchanted creature doesn't untap during its controller's untap step.",
    },
  ],
});
