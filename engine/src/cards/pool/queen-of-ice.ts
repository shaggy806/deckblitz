import { defineCard } from "../define.js";

// EDHREC rank 13529.
//
// Rulings:
//   [2019-10-04] If an object becomes a copy of an object that has an Adventure, the copy also has
//     an Adventure. If it changes zones, it will either cease to exist (if it's a token) or cease
//     to be a copy (if it's a nontoken permanent), and so you won't be able to cast it as an
//     Adventure.
//   [2019-10-04] When casting a spell as an Adventure, use the alternative characteristics and
//     ignore all of the card's normal characteristics. The spell's color, mana cost, mana value,
//     and so on are determined by only those alternative characteristics. If the spell leaves the
//     stack, it immediately resumes using its normal characteristics.
//   [2019-10-04] An adventurer card is a permanent card in every zone except the stack, as well as
//     while on the stack if not cast as an Adventure. Ignore its alternative characteristics in
//     those cases. For example, while it's in your graveyard, Giant Killer is a white creature
//     card whose mana value is 1. It can't be the target of the triggered ability of Mystic
//     Sanctuary.
//   [2019-10-04] If you cast an adventurer card as an Adventure, use only its alternative
//     characteristics to determine whether it's legal to cast that spell. For example, if Giant
//     Killer is exiled with the last ability of Vivien, Champion of the Wilds, you can't cast it
//     as Chop Down.
//   [2019-10-04] If a spell is cast as an Adventure, its controller exiles it instead of putting
//     it into its owner's graveyard as it resolves. For as long as it remains exiled, that player
//     may cast it as a permanent spell. If an Adventure spell leaves the stack in any way other
//     than resolving (most likely by being countered or by failing to resolve because its targets
//     have all become illegal), that card won't be exiled and the spell's controller won't be able
//     to cast it as a permanent later.
//   [2019-10-04] You must still follow any timing restrictions and permissions for the permanent
//     spell you cast from exile. Normally, you'll be able to cast it only during your main phase
//     while the stack is empty.
//   [2019-10-04] Casting a card as an Adventure isn't casting it for an alternative cost. Effects
//     that allow you to cast a spell for an alternative cost or without paying its mana cost may
//     allow you to apply those to the Adventure.
//   [2019-10-04] If an adventurer card ends up in exile for any other reason than by exiling
//     itself while resolving, it won't give you permission to cast it as a permanent spell.
//   [2019-10-04] If an effect copies an Adventure spell, that copy is exiled as it resolves. It
//     ceases to exist as a state-based action; it's not possible to cast the copy as a permanent.
//   [2019-10-04] Rage of Winter can target a creature that's already tapped. That creature won't
//     untap during its controller's next untap step.
//   [2019-10-04] A creature dealt combat damage by Queen of Ice won't untap during its
//     controller's next untap step, even if it was already tapped and even if Queen of Ice leaves
//     the battlefield before then (perhaps because that creature dealt lethal combat damage to
//     Queen of Ice).
//   [2019-10-04] If an effect instructs you to choose a card name, you may choose the alternative
//     Adventure name. Consider only the alternative characteristics to determine whether that is
//     an appropriate name to choose.

export default defineCard({
  name: "Queen of Ice",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Noble", "Wizard"],
  power: 2,
  toughness: 3,
  text: "Whenever this creature deals combat damage to a creature, tap that creature. It doesn't untap during its controller's next untap step.",
  faces: ["Queen of Ice", "Rage of Winter"],
  adventure: true,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "creature", combat: true },
      targets: [],
      effect: { kind: "tap", target: "trigger-recipient", doesntUntapNext: true },
      resolve: null,
      text: "Whenever this creature deals combat damage to a creature, tap that creature. It doesn't untap during its controller's next untap step.",
    },
  ],
});
