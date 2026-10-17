import { defineCard } from "../define.js";

// EDHREC rank 11348.
//
// Rulings:
//   [2023-09-01] If you copy a bargained spell, the copy is also bargained. If a card or token
//     enters the battlefield as a copy of a permanent that's already on the battlefield, the new
//     permanent isn't bargained, even if the original was.
//   [2023-09-01] Bargain represents an optional additional cost. A spell cast with that additional
//     cost paid is "bargained."
//   [2023-09-01] You may sacrifice only one artifact, enchantment, or token to pay a spell's
//     bargain cost.
//   [2023-09-01] Some instant and sorcery spells require additional targets if they're bargained.
//     You ignore those targeting requirements if those spells aren't bargained, and you can't
//     bargain those spells unless you can choose the appropriate targets. On the other hand, you
//     can bargain a permanent spell even if you won't be able to choose targets for an
//     enters-the-battlefield ability of that permanent once the spell resolves.
//   [2023-09-01] Bargain means "As an additional cost to cast this spell, you may sacrifice an
//     artifact, enchantment, or token."

export default defineCard({
  name: "Realm-Scorcher Hellkite",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 6,
  keywords: ["flying", "haste"],
  kicker: { cost: "", keyword: "bargain" },
  text: "Bargain (You may sacrifice an artifact, enchantment, or token as you cast this spell.)\nFlying, haste\nWhen this creature enters, if it was bargained, add four mana in any combination of colors.\n{1}{R}: This creature deals 1 damage to any target.",
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "{1}{R}: This creature deals 1 damage to any target.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["W", "U", "B", "R", "G"] }, amount: 4 },
      resolve: null,
      text: "When this creature enters, if it was bargained, add four mana in any combination of colors.",
      condition: { kind: "self-kicked" },
    },
  ],
});
