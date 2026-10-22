import { defineCard } from "../define.js";

// EDHREC rank 10857.
//
// Rulings:
//   [2020-08-07] Tapping an artifact won't cause its abilities to stop applying unless those
//     abilities say so.
//   [2020-08-07] If an artifact you control has a mana ability with {T} in the cost, activating
//     that ability while casting a spell with improvise will result in the artifact being tapped
//     when you pay the spell's costs. You won't be able to tap it again for improvise. Similarly,
//     if you sacrifice an artifact to activate a mana ability while casting a spell with
//     improvise, that artifact won't be on the battlefield when you pay the spell's costs, so you
//     won't be able to tap it for improvise.
//   [2020-08-07] Improvise doesn't change a spell's mana cost or mana value.
//   [2020-08-07] Equipment attached to a creature doesn't become tapped when that creature becomes
//     tapped, and tapping that Equipment doesn't cause the creature to become tapped.
//   [2020-08-07] When calculating a spell's total cost, include any alternative costs, additional
//     costs, or anything else that increases or reduces the cost to cast the spell. Improvise
//     applies after the total cost is calculated.
//   [2020-08-07] Improvise can't pay for {U} in Metallic Rebuke's total cost.

export default defineCard({
  name: "Metallic Rebuke",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Improvise (Your artifacts can help cast this spell. Each artifact you tap after you're done activating mana abilities pays for {1}.)\nCounter target spell unless its controller pays {3}.",
  // Improvise (rule 702.126a): artifacts tapped as it's cast pay its generic mana.
  improvise: true,
  targets: ["spell"],
  effect: { kind: "unless", chooser: 0, options: [{ pay: "{3}", text: "Pay {3}" }], otherwise: { kind: "counter", target: 0 } },
});
