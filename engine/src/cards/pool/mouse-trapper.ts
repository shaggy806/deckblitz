import { defineCard } from "../define.js";
import { valiant } from "../helpers.js";

// EDHREC rank 12928.
//
// Rulings:
//   [2024-07-26] If a spell or ability you control has one or more of its targets changed to a
//     creature you control with a valiant ability, that ability will trigger if that creature
//     hasn't yet been the target of a spell or ability you control this turn.
//   [2024-07-26] Valiant abilities will resolve before the spell or ability that caused them to
//     trigger.
//   [2024-07-26] If you create a copy of a spell on the stack and target a creature you control
//     with a valiant ability, that ability will trigger as long as the creature hasn't yet been
//     the target of a spell or ability you control this turn.

const VALIANT_TEXT =
  "Valiant — Whenever this creature becomes the target of a spell or ability you control for the first time each turn, tap target creature an opponent controls.";

export default defineCard({
  name: "Mouse Trapper",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Mouse", "Soldier"],
  power: 3,
  toughness: 2,
  keywords: ["flash"],
  text: `Flash\n${VALIANT_TEXT}`,
  triggered: [{ ...valiant({ kind: "tap", target: 0 }, VALIANT_TEXT), targets: ["creature-an-opponent-controls"] }],
});
