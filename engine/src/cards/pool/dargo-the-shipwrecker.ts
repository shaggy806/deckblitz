import { defineCard } from "../define.js";

// EDHREC rank 8253.
//
// Rulings:
//   [2020-11-10] The cost reduction for artifacts and creatures sacrificed earlier in the turn
//     will apply even if you don't sacrifice any as an additional cost.
//   [2020-11-10] An effect that checks whether you control your commander is satisfied if you
//     control one or both of your two commanders.
//   [2020-11-10] You can choose two commanders with partner that are the same color or colors. In
//     Commander Draft, you can even choose two of the same commander with partner if you drafted
//     them. If you do this, make sure you keep the number of times you've cast each from the
//     command zone clear for "commander tax" purposes.
//   [2020-11-10] Both commanders start in the command zone, and the remaining 98 cards (or 58
//     cards in a Commander Draft game) of your deck are shuffled to become your library.
//   [2020-11-10] To determine the total cost of a spell, start with the mana cost or alternative
//     cost you're paying, add any cost increases (such as the commander tax), then apply any cost
//     reductions (such as that of Dargo's first ability). Dargo's mana value is 7, no matter what
//     the total cost to cast it was.
//   [2020-11-10] Once the game begins, your two commanders are tracked separately. If you cast
//     one, you won't have to pay an additional {2} the first time you cast the other. A player
//     loses the game after having been dealt 21 damage from any one of them, not from both of them
//     combined.
//   [2020-11-10] Dargo's first ability can't reduce its cost below {R}. You can sacrifice any
//     number of artifacts and creatures, even if they won't reduce Dargo's cost any further.
//   [2020-11-10] The cost reduction is {2} per sacrificed permanent, whether that permanent was an
//     artifact, a creature, or both.
//   [2020-11-10] To have two commanders, both must have the partner ability as the game begins.
//     Losing the ability during the game doesn't cause either to cease to be your commander.
//   [2020-11-10] If something refers to your commander while you have two commanders, it refers to
//     one of them of your choice. If you are instructed to perform an action on your commander
//     (e.g. put it from the command zone into your hand due to Command Beacon), you choose one of
//     your commanders at the time the effect happens.
//   [2020-11-10] If your Commander deck has two commanders, you can only include cards whose own
//     color identities are also found in your commanders' combined color identities. If Falthis
//     and Kediss are your commanders, your deck may contain cards with black and/or red in their
//     color identity, but not cards with green, white, or blue.

export default defineCard({
  name: "Dargo, the Shipwrecker",
  manaCost: "{6}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Giant", "Pirate"],
  power: 7,
  toughness: 5,
  keywords: ["trample"],
  pairing: { kind: "partner" },
  text: "As an additional cost to cast this spell, you may sacrifice any number of artifacts and/or creatures. This spell costs {2} less to cast for each permanent sacrificed this way and {2} less to cast for each other artifact or creature you've sacrificed this turn.\nTrample\nPartner (You can have two commanders if both have partner.)",
  // How many is announced as it's cast; {2} off the generic part for each,
  // whether artifact, creature or both, and for each artifact or creature
  // sacrificed earlier this turn — even with none sacrificed now — never
  // below {R} (the rulings). Commander tax is added first.
  additionalCost: {
    sacrifice: { typesAnyOf: ["artifact", "creature"] },
    sacrificeCount: "x",
    sacrificeReduces: 2,
  },
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { turnHistory: "sacrificed", filter: { typesAnyOf: ["artifact", "creature"] }, times: 2 },
  },
});
