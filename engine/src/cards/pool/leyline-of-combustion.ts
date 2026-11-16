import { defineCard } from "../define.js";

// EDHREC rank 11006.
//
// Rulings:
//   Leyline of Combustion's triggered ability resolves before the spell that caused it to
//   trigger. It resolves even if that spell is countered.
//   If a spell targets you and/or a permanent you control multiple times, or if a spell
//   targets you and one or more permanents you control, Leyline of Combustion's triggered
//   ability triggers once.
//
// - "You and/or at least one permanent you control" is a `batched`
//   becomes-target watcher: once per spell or ability, however many of
//   them it targets. "That player" is the targeting player, filled in
//   slot 0 as Thunderbreak Regent's is.
const TRIGGER_TEXT =
  "Whenever you and/or at least one permanent you control becomes the target of a spell or ability an opponent controls, this enchantment deals 2 damage to that player.";

export default defineCard({
  name: "Leyline of Combustion",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  beginsOnBattlefield: true,
  text: `If this card is in your opening hand, you may begin the game with it on the battlefield.\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "you-control", player: "you", byOpponentOnly: true, batched: true },
      targets: ["player"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
