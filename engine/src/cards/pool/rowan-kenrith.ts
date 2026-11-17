import { defineCard } from "../define.js";

// EDHREC rank 13730. "Can be your commander" is `canBeCommander` (the
// rulings: Commander games only; elsewhere it does nothing).
//
// Rulings:
//   [2018-06-08] The copy will have the same targets as the spell or ability it's copying unless
//     you choose new ones. You may change any number of the targets, including all of them or none
//     of them. If, for one of the targets, you can't choose a new legal target, then it remains
//     unchanged (even if the current target is illegal).
//   [2018-06-08] Both commanders start in the command zone, and the remaining 98 cards of your
//     deck are shuffled to become your library.
//   [2018-06-08] An effect that checks whether you control your commander is satisfied if you
//     control one or both of your two commanders.
//   [2018-06-08] The second ability represented by the "partner with [name]" keyword modifies the
//     rules for deck construction in the Commander variant and has no function outside of that
//     variant. If a legendary creature card with "partner with [name]" is designated as your
//     commander, the named legendary creature card can also be designated as your commander. For
//     more information on the Commander variant, please visit Wizards.com/Commander.
//   [2018-06-08] The ability of Will's emblem can copy any instant or sorcery spell, not just one
//     with targets. Similarly, the ability of Rowan's emblem can copy any activated ability that
//     isn't a mana ability. A mana ability is an ability that produces mana, not an ability that
//     costs mana.
//   [2018-06-08] The triggered ability of the "partner with" keyword still triggers in a Commander
//     game. If your other commander has somehow ended up in your library, you can find it. You can
//     also target another player who might have that card in their library.
//   [2018-06-08] Note that the target player searches their library (which may be affected by
//     effects such as that of Stranglehold) and that the card they find is revealed, even though
//     these words aren't included in the ability's reminder text.
//   [2018-06-08] If the spell or ability has damage divided as it was cast or activated (like
//     Chandra's Pyrohelix), the division can't be changed (although the targets receiving that
//     damage still can).
//   [2018-06-08] The ability of either Kenrith's emblem can copy the spell or ability even if that
//     spell or ability is countered before the emblem's triggered ability resolves.
//   [2018-06-08] If you have two of Will's emblems, perhaps because Rowan's emblem copied Will's
//     last ability, each one will copy a spell you cast. The same is true of Rowan's emblem in
//     regard to abilities you activate.
//   [2018-06-08] If your Commander deck has two commanders, you can only include cards whose own
//     color identities are also found in your commanders' combined color identities. If Khorvath
//     and Sylvia are your commanders, your deck may contain cards with red and/or white in their
//     color identity, but not blue, black, or green.
//   [2018-06-08] "Partner with [name]" represents two abilities. The first is a triggered ability:
//     "When this permanent enters the battlefield, target player may search their library for a
//     card named [name], reveal it, put it into their hand, then shuffle their library."
//   [2018-06-08] The copy of the spell created by Will's emblem resolves before the original
//     spell. The same is true of the copy of the activated ability created by Rowan's emblem.
//   [2018-06-08] If the spell or ability that's copied is modal (that is, it says "Choose one —"
//     or the like), the copy will have the same mode. A different mode can't be chosen.
//   [2018-06-08] Once the game begins, your two commanders are tracked separately. If you cast
//     one, you won't have to pay an additional {2} the first time you cast the other. A player
//     loses the game after having been dealt 21 damage from one of them, not from both of them
//     combined. Command Beacon's effect puts one into your hand from the command zone, not both.
//   [2018-06-08] To have two commanders, both must have the partner ability (featured in the
//     Magic: The Gathering—Commander™ (2016 Edition) set) or corresponding "partner with"
//     abilities as the game begins. A creature with a "partner with" ability can't partner with
//     any creature other than its designated partner. Losing a partner ability during the game
//     doesn't cause either to cease to be your commander.
//   [2018-06-08] Rowan's second ability targets only the player. Tapped creatures with hexproof
//     that player controls will be dealt damage as that ability resolves.
//   [2018-06-08] The controller of a copied spell can't choose to pay any alternative or
//     additional costs for the copy. However, effects based on any alternative or additional costs
//     that were paid for the original spell are copied as though those same costs were paid for
//     the copy. Similarly, for Rowan's emblem, effects based on non-mana costs that were paid for
//     the original ability are copied as though those same costs were paid for the copy.
//   [2018-06-08] The copy is created on the stack, so it's not "cast" or "activated." Abilities
//     that trigger when a player casts a spell or activates an ability (such as either emblem's
//     own ability) won't trigger.
//   [2018-06-08] If the spell or ability that's copied has an X whose value was determined as it
//     was cast or activated (like Blaze does), the copy will have the same value of X.
//   [2018-06-08] The last abilities of Will and Rowan apply to Commander games only. They have no
//     effect in other games.

const EMBLEM = "Whenever you activate an ability that isn't a mana ability, copy it. You may choose new targets for the copy.";

export default defineCard({
  name: "Rowan Kenrith",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Rowan"],
  loyalty: 4,
  pairing: { kind: "partner-with", name: "Will Kenrith" },
  canBeCommander: true,
  text: "+2: During target player's next turn, each creature that player controls attacks if able.\n−2: Rowan Kenrith deals 3 damage to each tapped creature target player controls.\n−8: Target player gets an emblem with \"Whenever you activate an ability that isn't a mana ability, copy it. You may choose new targets for the copy.\"\nPartner with Will Kenrith\nRowan Kenrith can be your commander.",
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: ["player"],
      // Taunt's shape: each creature that player controls as they declare
      // attackers in their next turn, one that arrived since included.
      effect: {
        kind: "restrict",
        filter: { controlledBy: "you", type: "creature" },
        controlledByTarget: 0,
        restrictions: ["must-attack"],
        duration: { duringTurnOf: { target: 0 } },
      },
      resolve: null,
      text: "+2: During target player's next turn, each creature that player controls attacks if able.",
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: ["player"],
      effect: { kind: "damage-all", filter: { type: "creature", tapped: true }, amount: 3, controlledByTarget: 0 },
      resolve: null,
      text: "−2: Rowan Kenrith deals 3 damage to each tapped creature target player controls.",
    },
    {
      loyaltyCost: -8,
      cost: { mana: null, tap: false },
      targets: ["player"],
      effect: {
        kind: "create-emblem",
        to: 0,
        text: EMBLEM,
        triggered: [
          {
            trigger: { on: "activates-ability", who: "you" },
            targets: [],
            effect: { kind: "copy-ability", target: "trigger-ability", newTargets: true },
            resolve: null,
            text: EMBLEM,
          },
        ],
      },
      resolve: null,
      text: `−8: Target player gets an emblem with "${EMBLEM}"`,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "each-player-may",
        who: { controllerOf: 0 },
        prompt: "Search your library for a card named Will Kenrith?",
        effect: {
          kind: "search-library",
          filter: { name: "Will Kenrith" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: "When this permanent enters, target player may search their library for a card named Will Kenrith, reveal it, put it into their hand, then shuffle.",
    },
  ],
});
