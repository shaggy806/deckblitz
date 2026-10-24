import { defineCard } from "../define.js";

// EDHREC rank 4856.
//
// Rulings:
//   [2014-11-24] The token copies exactly what was printed on the original creature and nothing
//     else (unless that permanent is copying something else or is a token; see below). It doesn't
//     copy whether that creature has any counters on it or Auras and/or Equipment attached to it,
//     or any non-copy effects that changed its power, toughness, types, color, and so on. Notably,
//     it doesn't copy any effects that may have turned a noncreature permanent into a creature. If
//     the token isn't a creature as it enters the battlefield, it won't be attacking.
//   [2014-11-24] If another creature becomes or enters the battlefield as a copy of the token, you
//     won't exile that creature at end of combat. However, if Flamerush Rider creates multiple
//     tokens due to a replacement effect (like the one Doubling Season creates), you'll exile each
//     of those tokens.
//   [2014-11-24] If you pay the dash cost to cast a creature spell, that card will be returned to
//     its owner's hand only if it's still on the battlefield when its triggered ability resolves.
//     If it dies or goes to another zone before then, it will stay where it is.
//   [2014-11-24] If the copied creature was copying something else, the token enters the
//     battlefield as whatever that creature was copying.
//   [2014-11-24] If you choose to pay the dash cost rather than the mana cost, you're still
//     casting the spell. It goes on the stack and can be responded to and countered. You can cast
//     a creature spell for its dash cost only when you otherwise could cast that creature spell.
//     Most of the time, this means during your main phase when the stack is empty.
//   [2014-11-24] If the copied creature had {X} in its mana cost, X is 0.
//   [2014-11-24] Any enters-the-battlefield abilities of the copied creature will trigger when the
//     token enters the battlefield. Any "As [this creature] enters the battlefield" or "[This
//     creature] enters the battlefield with" abilities of the copied creature will also work.
//   [2014-11-24] If a creature enters the battlefield as a copy of or becomes a copy of a creature
//     whose dash cost was paid, the copy won't have haste and won't be returned to its owner's
//     hand.
//   [2014-11-24] If the copied creature is a token, the token created by Flamerush Rider copies
//     the original characteristics of that token as stated by the effect that put it onto the
//     battlefield.
//   [2014-11-24] You don't have to attack with the creature with dash unless another ability says
//     you do.
//   [2014-11-24] You choose which opponent or opposing planeswalker the token is attacking as you
//     put it onto the battlefield. It doesn't have to be the same player or planeswalker Flamerush
//     Rider is attacking.
//   [2014-11-24] Although the token is attacking, it was never declared as an attacking creature
//     (for purposes of abilities that trigger whenever a creature attacks, for example).

export default defineCard({
  name: "Flamerush Rider",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 3,
  dash: { cost: "{2}{R}{R}" },
  text: "Whenever this creature attacks, create a token that's a copy of another target attacking creature and that's tapped and attacking. Exile the token at end of combat.\nDash {2}{R}{R} (You may cast this spell for its dash cost. If you do, it gains haste, and it's returned from the battlefield to its owner's hand at the beginning of the next end step.)",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "other", of: { kind: "permanent", filter: { type: "creature", attacking: true } } }],
      effect: {
        kind: "create-token-copy",
        of: 0,
        count: 1,
        who: "you",
        tapped: true,
        attacking: "choose",
        exileAtEndOfCombat: true,
      },
      resolve: null,
      text: "Whenever this creature attacks, create a token that's a copy of another target attacking creature and that's tapped and attacking. Exile the token at end of combat.",
    },
  ],
});
