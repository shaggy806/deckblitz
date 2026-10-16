import { defineCard } from "../define.js";

// EDHREC rank 7643.
//
// Rulings:
//   [2023-11-10] If you cast an adventurer card as an Adventure, use only its alternative
//     characteristics to determine whether it's legal to cast that spell. For example, if you
//     control Johann, Apprentice Sorcerer ("Once each turn, you may cast an instant or sorcery
//     spell from the top of your library") and Promise of Aclazotz is on top of your library, you
//     can cast Foul Rebirth, but not Promise of Aclazotz.
//   [2023-11-10] You must still follow any timing restrictions and permissions for the permanent
//     spell you cast from exile. Normally, you'll be able to cast it only during your main phase
//     while the stack is empty.
//   [2023-11-10] If an object becomes a copy of an object that has an Adventure, the copy also has
//     an Adventure. If it changes zones, it will either cease to exist (if it's a token) or cease
//     to be a copy (if it's a nontoken permanent), and so you won't be able to cast it as an
//     Adventure.
//   [2023-11-10] If an effect copies an Adventure spell, that copy is exiled as it resolves. It
//     ceases to exist as a state-based action; it's not possible to cast the copy as a permanent.
//   [2023-11-10] If an effect refers to a card, spell, or permanent that has an Adventure, it
//     won't find an instant or sorcery spell on the stack that's been cast as an Adventure.
//   [2023-11-10] If an effect instructs you to choose a card name, you may choose the alternative
//     Adventure name. Consider only the alternative characteristics to determine whether that is
//     an appropriate name to choose.
//   [2023-11-10] Casting a card as an Adventure isn't casting it for an alternative cost. Effects
//     that allow you to cast a spell for an alternative cost or without paying its mana cost may
//     allow you to apply those to the Adventure.
//   [2023-11-10] When casting a spell as an Adventure, use the alternative characteristics and
//     ignore all of the card's normal characteristics. The spell's color, mana cost, mana value,
//     and so on are determined by only those alternative characteristics. If the spell leaves the
//     stack, it immediately resumes using its normal characteristics.
//   [2023-11-10] An adventurer card is a permanent card in every zone except the stack, as well as
//     while on the stack if not cast as an Adventure. Ignore its alternative characteristics in
//     those cases. For example, while it's in your graveyard, Promise of Aclazotz is a black
//     enchantment card whose mana value is 2. While there, it can't be the target of a spell or
//     ability that targets only instant or sorcery cards.
//   [2023-11-10] If a spell is cast as an Adventure, its controller exiles it instead of putting
//     it into its owner's graveyard as it resolves. For as long as it remains exiled, that player
//     may cast it as a permanent spell. If an Adventure spell leaves the stack in any way other
//     than resolving (most likely by being countered or by failing to resolve because its targets
//     have all become illegal), that card won't be exiled and the spell's controller won't be able
//     to cast it as a permanent later.
//   [2023-11-10] If an adventurer card ends up in exile for any other reason than by exiling
//     itself while resolving, it won't give you permission to cast it as a permanent spell.
//   [2023-11-10] An effect may refer to a card, spell, or permanent that "has an Adventure." This
//     refers to a card, spell, or permanent that has an adventurer card's set of alternative
//     characteristics, even if they're not being used and even if that card was never cast as an
//     Adventure.
//   [2024-01-12] If you choose to copy a creature token that's a copy of another creature, the new
//     creature token will copy the characteristics of whatever the original token is copying.
//   [2024-01-12] If you control no creature tokens when you populate, nothing will happen.
//   [2024-01-12] Any enters-the-battlefield abilities of the copied token will trigger when the
//     new token enters the battlefield. Any "as [this creature] enters the battlefield" or "[this
//     creature] enters the battlefield with" abilities of the copied token will also work.
//   [2024-01-12] The new creature token copies the characteristics of the original token as stated
//     by the effect that created the original token.
//   [2024-01-12] Populate doesn't target the creature token you're copying. You choose that
//     creature token as you're taking the populate action. You can choose any creature token you
//     control. If a spell or ability causes you to create a creature token and then instructs you
//     to populate, you may choose to copy the token you just created, or you may choose to copy
//     another creature token you control.
//   [2024-01-12] The new token doesn't copy whether the original token is tapped or untapped,
//     whether it has any counters on it or Auras and Equipment attached to it, or any noncopy
//     effects that have changed its power, toughness, color, and so on.

// Wilhelt, the Rotcleaver's "you may sacrifice …. If you do" (an
// `each-player-may` of the controller alone) with Growing Ranks' populate.
// The Adventure half is Foul Rebirth.
const TEXT =
  "At the beginning of your end step, you may sacrifice a non-Demon creature. If you do, populate. (Create a token that's a copy of a creature token you control.)";

export default defineCard({
  name: "Promise of Aclazotz",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [
          { sacrifice: { type: "creature", notSubtypes: ["Demon"] }, text: "Sacrifice a non-Demon creature" },
        ],
        ifDid: { kind: "populate" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Promise of Aclazotz", "Foul Rebirth"],
  adventure: true,
});
