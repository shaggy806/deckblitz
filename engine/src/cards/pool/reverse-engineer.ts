import { defineCard } from "../define.js";

// EDHREC rank 8026.
//
// Rulings:
//   [2018-07-13] Improvise doesn't change a spell's mana cost or mana value.
//   [2018-07-13] When calculating a spell's total cost, include any alternative costs, additional
//     costs, or anything else that increases or reduces the cost to cast the spell. Improvise
//     applies after the total cost is calculated.
//   [2018-07-13] Improvise can't pay for {W}, {U}, {B}, {R}, {G}, or {C} mana symbols in a spell's
//     total cost.
//   [2018-07-13] Tapping an artifact won't cause its abilities to stop applying unless those
//     abilities say so.
//   [2018-07-13] Equipment attached to a creature doesn't become tapped when that creature becomes
//     tapped, and tapping that Equipment doesn't cause the creature to become tapped.
//   [2018-07-13] If an artifact you control has a mana ability with {T} in the cost, activating
//     that ability while casting a spell with improvise will result in the artifact being tapped
//     when you pay the spell's costs. You won't be able to tap it again for improvise. Similarly,
//     if you sacrifice an artifact to activate a mana ability while casting a spell with
//     improvise, that artifact won't be on the battlefield when you pay the spell's costs, so you
//     won't be able to tap it for improvise.
//   [2018-07-13] When using improvise to cast a spell with {X} in its mana cost, first choose the
//     value for X. That choice, plus any cost increases or decreases, will determine the spell's
//     total cost. Then you can tap artifacts you control to help pay that cost. For example, if
//     you cast Saheeli's Directive and choose X to be 3, the total cost is {3}{R}{R}{R}. If you
//     tap two artifacts, you'll have to pay {1}{R}{R}{R}.
//   [2018-07-13] Improvise can't be used to pay for anything other than the cost of casting the
//     spell. For example, it can't be used during the resolution of an ability that says “Counter
//     target spell unless its controller pays {3}.”

export default defineCard({
  name: "Reverse Engineer",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Improvise (Your artifacts can help cast this spell. Each artifact you tap after you're done activating mana abilities pays for {1}.)\nDraw three cards.",
  // Improvise (rule 702.126a): artifacts tapped as it's cast pay its generic mana.
  improvise: true,
  targets: [],
  effect: { kind: "draw", amount: 3 },
});
