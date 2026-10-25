import { defineCard } from "../define.js";

// EDHREC rank 11049.
//
// Rulings:
//   [2018-07-13] Improvise can't pay for {W}, {U}, {B}, {R}, {G}, or {C} mana symbols in a spell's
//     total cost.
//   [2018-07-13] When using improvise to cast a spell with {X} in its mana cost, first choose the
//     value for X. That choice, plus any cost increases or decreases, will determine the spell's
//     total cost. Then you can tap artifacts you control to help pay that cost. For example, if
//     you cast Saheeli's Directive and choose X to be 3, the total cost is {3}{R}{R}{R}. If you
//     tap two artifacts, you'll have to pay {1}{R}{R}{R}.
//   [2018-07-13] If an artifact you control has a mana ability with {T} in the cost, activating
//     that ability while casting a spell with improvise will result in the artifact being tapped
//     when you pay the spell's costs. You won't be able to tap it again for improvise. Similarly,
//     if you sacrifice an artifact to activate a mana ability while casting a spell with
//     improvise, that artifact won't be on the battlefield when you pay the spell's costs, so you
//     won't be able to tap it for improvise.
//   [2018-07-13] Saheeli's Directive considers the individual mana values of the artifact cards
//     you reveal. The sum of their mana values may be greater than X.
//   [2018-07-13] Improvise doesn't change a spell's mana cost or mana value.
//   [2018-07-13] When calculating a spell's total cost, include any alternative costs, additional
//     costs, or anything else that increases or reduces the cost to cast the spell. Improvise
//     applies after the total cost is calculated.
//   [2018-07-13] Equipment attached to a creature doesn't become tapped when that creature becomes
//     tapped, and tapping that Equipment doesn't cause the creature to become tapped.
//   [2018-07-13] Tapping an artifact won't cause its abilities to stop applying unless those
//     abilities say so.
//   [2018-07-13] If a card in your library has {X} in its mana cost, X is considered to be 0.
//   [2018-07-13] All of the artifacts put onto the battlefield this way enter at the same time. If
//     any have triggered abilities that trigger on something else entering the battlefield,
//     they'll see each other.
//   [2018-07-13] Improvise can't be used to pay for anything other than the cost of casting the
//     spell. For example, it can't be used during the resolution of an ability that says "Counter
//     target spell unless its controller pays {3}."

export default defineCard({
  name: "Saheeli's Directive",
  manaCost: "{X}{R}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  improvise: true,
  text: "Improvise (Each artifact you tap after you're done activating mana abilities pays for {1}.)\nReveal the top X cards of your library. You may put any number of artifact cards with mana value X or less from among them onto the battlefield. Then put all cards revealed this way that weren't put onto the battlefield into your graveyard.",
  // Genesis Wave's shape, artifacts only: each card's own mana value is
  // checked, not their sum (the ruling).
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: "x",
    reveal: true,
    min: 0,
    max: "x",
    destination: "battlefield",
    leftover: "graveyard",
    filter: { type: "artifact", manaValue: { op: "lte", n: { amount: "x" } } },
  },
});
