import { defineCard } from "../define.js";

// EDHREC rank 9455.
//
// Rulings:
//   [2022-10-14] Similarly, an ability of another card that instructs you to "transform" one of
//     these cards will cause you to convert it, even if that ability doesn't use the word
//     "convert."
//   [2022-10-14] The mana value of a converted permanent on the battlefield is equal to the mana
//     value of the card's front face, no matter which face is up.
//   [2022-10-14] While it's a creature, the Vehicle has its printed power and toughness.
//   [2022-10-14] A spell cast this way enters the battlefield with its back face up.
//   [2022-10-14] Any triggered ability of another card that triggers whenever a permanent
//     transforms will also trigger whenever a permanent converts.
//   [2022-10-14] "Living metal" means "As long as it's your turn, this permanent is an artifact
//     creature in addition to its other types."
//   [2022-10-14] The convert keyword action functions the same way as the transform keyword action
//     found on some other cards; to convert a permanent on the battlefield, turn it over so that
//     its other face is up.
//   [2022-10-14] If a static ability of another permanent applies only to noncreature permanents,
//     that ability applies to a Vehicle with living metal only during your opponents' turns. For
//     example, if you control Arcee, Acrobatic Coupe and March of the Machines, Arcee will be a
//     2/2 artifact creature during your turn and a 3/3 artifact creature (because its mana value
//     is 3) during each opponent's turn.
//   [2022-10-14] Bolster doesn't target; you choose the creature to put the counters on as the
//     attack triggered ability resolves.
//   [2022-10-14] If you copy a permanent spell cast this way, the copy has the characteristics of
//     the card's back face, even though it isn't itself a double-faced card.
//   [2022-10-14] To determine the total cost of a spell, start with the mana cost or alternative
//     cost (such as a More Than Meets the Eye cost) you're paying, add any cost increases, then
//     apply any cost reductions. The mana value of a spell cast using More Than Meets the Eye is
//     determined by the mana cost on the front face of the card, no matter what the total cost to
//     cast the spell was.
//   [2022-10-14] To bolster 2, put two +1/+1 counters on the creature with the least toughness
//     among creatures you control. If more than one creature is tied for the least toughness,
//     choose one of them.
//   [2022-10-14] When you cast a spell using its More Than Meets the Eye ability, the card is put
//     onto the stack with its back face up. The resulting spell has all characteristics of that
//     face.
//   [2022-10-14] The cost is an alternative cost, so it can't be combined with any other
//     alternative costs. It can be combined with any applicable additional costs.
//   [2022-10-14] Converting a permanent doesn't affect any Auras or Equipment that are attached to
//     it. Similarly, any counters on the permanent will remain on that permanent after it
//     converts. Any continuous effects from a resolved spell or ability will continue to affect
//     it. Any spells or abilities on the stack that target a permanent continue to do so after
//     that permanent converts.
//   [2022-10-14] "More Than Meets the Eye [cost]" means "You may cast this card converted by
//     paying [cost] rather than its mana cost." It functions in any zone from which the spell can
//     be cast.

export default defineCard({
  name: "Optimus Prime, Hero",
  manaCost: "{3}{U}{R}{W}",
  colors: ["W", "U", "R"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 4,
  toughness: 8,
  text: "More Than Meets the Eye {2}{U}{R}{W} (You may cast this card converted for {2}{U}{R}{W}.)\nAt the beginning of each end step, bolster 1. (Choose a creature with the least toughness among creatures you control and put a +1/+1 counter on it.)\nWhen Optimus Prime dies, return it to the battlefield converted under its owner's control.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      targets: [],
      effect: { kind: "bolster", amount: 1 },
      resolve: null,
      text: "At the beginning of each end step, bolster 1.",
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "trigger-object", transformed: true },
      resolve: null,
      text: "When Optimus Prime dies, return it to the battlefield converted under its owner's control.",
    },
  ],
  faces: ["Optimus Prime, Hero", "Optimus Prime, Autobot Leader"],
  transform: true,
  moreThanMeetsTheEye: { cost: "{2}{U}{R}{W}" },
});
