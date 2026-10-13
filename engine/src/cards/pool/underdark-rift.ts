import { defineCard } from "../define.js";

// EDHREC rank 6924.
//
// Rulings:
//   [2021-07-23] Tournament events have more specific rules regarding dice and die-rolling. For
//     more information, please see the most recent version of the Magic Tournament Rules at
//     https://wpn.wizards.com/en/document/magic-gathering-tournament-rules.
//   [2021-07-23] Dice used must have equally likely outcomes and the roll must be fair. Although
//     physical dice are recommended, digital substitutes are allowed, provided they have the same
//     number of equally likely outcomes as specified in the original roll instruction.
//   [2021-07-23] An ability that tells you to roll a die will also specify what to do with the
//     result of that roll. Most often, this is in the form of a “results table” in the card text.
//   [2021-07-23] If that permanent's owner has fewer than X cards in their library, put the
//     permanent on the bottom of its owner's library.
//   [2021-07-23] Some effects may modify the result of a die roll. This may be part of the
//     instruction to roll a die or it may come from other cards. Anything that references the
//     “result” of a die roll is looking for the result after these modifications. Anything that is
//     looking for the “natural result” is looking for the number shown on the face of the die
//     before these modifications.
//   [2021-07-23] While playing Planechase, rolling the planar die will cause any ability that
//     triggers whenever a player rolls one or more dice to trigger. However, any effect that
//     refers to a numerical result will ignore the rolling of the planar die.
//   [2021-07-23] Some effects instruct you to roll again. This uses the same number and type of
//     dice as the original roll, and that roll will use the same set of possible outcomes.
//   [2021-07-23] Some abilities, like that of Pixie Guide and Barbarian Class, replace rolling a
//     die with rolling extra dice and ignoring the lowest roll. The ignored rolls are not
//     considered for the effect that instructed you to roll a die, and do not cause abilities to
//     trigger. For all intents and purposes, once you determine which dice count, any extra dice
//     were never rolled.
//   [2021-07-23] An effect that says “choose a target, then roll a d20” or similar still uses the
//     normal process of putting an ability on the stack and resolving it. Choosing targets is part
//     of putting the ability on the stack and rolling the d20 happens later, as the ability
//     resolves.
//   [2021-07-23] Dice are identified by the number of faces each one has. For example, a d20 is a
//     twenty-sided die.
//   [2021-07-23] The instruction to roll a die and the effect that occurs because of the result
//     are all part of the same ability. Players do not get the chance to respond to the ability
//     after knowing the result of the roll.

// "Just beneath the top X cards" is X + 1st from the top — on the bottom of a
// library with X cards or fewer (the ruling). A d10's result is 1–10: nothing
// in the engine modifies a die's result, so the table names every one.
const BENEATH_TOP_X = Array.from({ length: 10 }, (_, i) => ({
  min: i + 1,
  max: i + 1,
  effect: { kind: "put-on-library", target: 0, position: { fromTop: i + 2 } } as const,
}));

export default defineCard({
  name: "Underdark Rift",
  colors: [],
  types: ["land"],
  text: "{T}: Add {C}.\n{5}, {T}, Exile this land: Roll a d10. Put target artifact, creature, or planeswalker into its owner's library just beneath the top X cards of that library, where X is the result. Activate only as a sorcery.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{5}", tap: true, exileSelf: true },
      targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "creature", "planeswalker"] } }],
      effect: { kind: "roll-dice", sides: 10, table: BENEATH_TOP_X },
      resolve: null,
      text: "{5}, {T}, Exile this land: Roll a d10. Put target artifact, creature, or planeswalker into its owner's library just beneath the top X cards of that library, where X is the result. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
});
