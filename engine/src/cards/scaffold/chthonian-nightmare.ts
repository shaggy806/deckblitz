import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 2369.
//
// Rulings:
//   [2024-06-07] Some spells and abilities that give you {E} may require targets. If each target
//     chosen is an illegal target as that spell or ability tries to resolve, it won't resolve. You
//     won't get any {E}.
//   [2024-06-07] Energy counters aren't mana. They don't go away as steps, phases, and turns end,
//     and effects that add mana "of any type" can't give you energy counters.
//   [2024-06-07] Some triggered abilities state that you "may pay" a certain amount of {E}. You
//     can't pay that amount multiple times to multiply the effect. You simply choose whether or
//     not to pay that amount of {E} as the ability resolves.
//   [2024-06-07] If an effect says you get one or more {E}, you get that many energy counters. To
//     pay one or more {E}, you lose that many energy counters. You can't pay more energy counters
//     than you have. Any effects that interact with counters a player gets, has, or loses can
//     interact with energy counters.
//   [2024-06-07] Keep track of how many energy counters each player has. Potential ways to track
//     this include writing theme down on paper or using dice, but any method that is clear and
//     mutually agreeable is fine. (At higher levels of tournament play, dice may not be allowed
//     for tracking counters that players have.)
//   [2024-06-07] Energy counters are a kind of counter that a player may have. They're not
//     associated with any specific permanents.
//   [2024-06-07] Some triggered abilities that state that you "may pay" a certain amount of {E}
//     describe an effect that happens "If you do." In that case, no player may take actions to try
//     to stop the ability's effect after you make your choice. If the payment is followed by the
//     phrase "When you do," then you'll choose any targets for that reflexive triggered ability
//     and put it on the stack before players can take actions.
//   [2024-06-07] If a spell or ability with one or more targets states that you "may pay" some
//     amount of {E}, and each permanent that it targets has become an illegal target, the spell or
//     ability won't resolve. You can't pay any {E} even if you want to.
//   [2024-06-07] {E} is the energy symbol. It represents one energy counter.
//   [2024-06-07] Chthonian Nightmare's last ability must have a target to be activated. You can't
//     activate it without a target in order to return Chthonian Nightmare to your hand.
//   [2024-06-07] If a card in your graveyard has {X} in its mana cost, X is 0 when determining its
//     mana value.

export default defineCard({
  name: "Chthonian Nightmare",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: "When this enchantment enters, you get {E}{E}{E} (three energy counters).\nPay X {E}, Sacrifice a creature, Return this enchantment to its owner's hand: Return target creature card with mana value X from your graveyard to the battlefield. Activate only as a sorcery.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 3 },
      resolve: null,
      text: "When this enchantment enters, you get {E}{E}{E}.",
    },
  ],
  // TODO(scaffold): Pay X {E}, Sacrifice a creature, Return this enchantment to its owner's hand: Return target creature card with mana value X from your graveyard to the battlefield. Activate only as a sorcery.
});
