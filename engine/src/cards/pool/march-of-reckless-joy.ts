import { defineCard } from "../define.js";

// EDHREC rank 7903. March of Otherworldly Light's cost; Unlucky Witness's
// shared permission (`upTo`): two plays in all among the exiled cards, chosen
// as they're played (the ruling), until the end of your next turn.
//
// Rulings:
//   You may exile more cards than necessary for March of Reckless Joy's first ability, but you can't
//     reduce the mana it costs to less than {R} this way.
//   You choose which cards that you are playing from exile as you play them, not as March of
//     Reckless Joy is resolving.

const COST_TEXT =
  "As an additional cost to cast this spell, you may exile any number of red cards from your hand. This spell costs {2} less to cast for each card exiled this way.";
const EFFECT_TEXT =
  "Exile the top X cards of your library. You may play up to two of those cards until the end of your next turn.";

export default defineCard({
  name: "March of Reckless Joy",
  manaCost: "{X}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `${COST_TEXT}\n${EFFECT_TEXT}`,
  additionalCost: { exileFromHandReduces: { filter: { colors: ["R"] }, each: 2 } },
  targets: [],
  effect: { kind: "impulse-exile", amount: "x", duration: "your-next-turn", upTo: 2 },
});
