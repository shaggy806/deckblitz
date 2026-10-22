import { defineCard } from "../define.js";

// EDHREC rank 11511.
//
// Rulings:
//   [2017-02-09] Equipment attached to a creature doesn't become tapped when that creature becomes
//     tapped, and tapping that Equipment doesn't cause the creature to become tapped.
//   [2017-02-09] Tapping an artifact won't cause its abilities to stop applying unless those
//     abilities say so.
//   [2017-02-09] If an artifact you control has a mana ability with {T} in the cost, activating
//     that ability while casting a spell with improvise will result in the artifact being tapped
//     when you pay the spell's costs. You won't be able to tap it again for improvise. Similarly,
//     if you sacrifice an artifact to activate a mana ability while casting a spell with
//     improvise, that artifact won't be on the battlefield when you pay the spell's costs, so you
//     won't be able to tap it for improvise.
//   [2017-02-09] When calculating a spell's total cost, include any alternative costs, additional
//     costs, or anything else that increases or reduces the cost to cast the spell. Improvise
//     applies after the total cost is calculated.
//   [2017-02-09] Improvise can't pay for {W}, {U}, {B}, {R}, {G}, or {C} mana symbols in a spell's
//     total cost.
//   [2017-02-09] Improvise can't be used to pay for anything other than the cost of casting the
//     spell. For example, it can't be used during the resolution of an ability that says “Counter
//     target spell unless its controller pays {3}.”
//   [2017-02-09] Improvise doesn't change a spell's mana cost or mana value.
//   [2017-02-09] Because improvise isn't an alternative cost, it can be used in conjunction with
//     alternative costs.

export default defineCard({
  name: "Herald of Anguish",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: "Improvise (Your artifacts can help cast this spell. Each artifact you tap after you're done activating mana abilities pays for {1}.)\nFlying\nAt the beginning of your end step, each opponent discards a card.\n{1}{B}, Sacrifice an artifact: Target creature gets -2/-2 until end of turn.",
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false, sacrifice: { filter: { type: "artifact" } } },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: -2, toughness: -2, duration: "end-of-turn" },
      resolve: null,
      text: "{1}{B}, Sacrifice an artifact: Target creature gets -2/-2 until end of turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "discard", target: "each-opponent", amount: 1 },
      resolve: null,
      text: "At the beginning of your end step, each opponent discards a card.",
    },
  ],
  // Improvise (rule 702.126a): artifacts tapped as it's cast pay its generic mana.
  improvise: true,
});
