import { defineCard } from "../define.js";
import { valiant } from "../helpers.js";

// EDHREC rank 11301.
//
// Rulings:
//   [2024-07-26] Valiant abilities will resolve before the spell or ability that caused them to
//     trigger.
//   [2024-07-26] If you create a copy of a spell on the stack and target a creature you control
//     with a valiant ability, that ability will trigger as long as the creature hasn't yet been
//     the target of a spell or ability you control this turn.
//   [2024-07-26] If a spell or ability you control has one or more of its targets changed to a
//     creature you control with a valiant ability, that ability will trigger if that creature
//     hasn't yet been the target of a spell or ability you control this turn.

const VALIANT_TEXT =
  "Valiant — Whenever this creature becomes the target of a spell or ability you control for the first time each turn, it gets +0/+2 until end of turn.";
const SAC_TEXT = "{1}, Sacrifice this creature: Destroy target artifact or enchantment.";

export default defineCard({
  name: "Nettle Guard",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Mouse", "Soldier"],
  power: 3,
  toughness: 1,
  text: `${VALIANT_TEXT}\n${SAC_TEXT}`,
  triggered: [
    valiant({ kind: "modify-pt", target: "source", power: 0, toughness: 2, duration: "end-of-turn" }, VALIANT_TEXT),
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: "self" },
      targets: ["artifact-or-enchantment"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
