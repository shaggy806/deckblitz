import { defineCard } from "../define.js";
import { unearth } from "../helpers.js";

// EDHREC rank 7032.
//
// Rulings:
//   [2024-06-07] If you activate a card's unearth ability but that card is removed from your
//     graveyard before the ability resolves, that unearth ability will do nothing as it resolves.
//   [2024-06-07] Some triggered abilities that state that you "may pay" a certain amount of {E}
//     describe an effect that happens "If you do." In that case, no player may take actions to try
//     to stop the ability's effect after you make your choice. If the payment is followed by the
//     phrase "When you do," then you'll choose any targets for that reflexive triggered ability
//     and put it on the stack before players can take actions.
//   [2024-06-07] Energy counters are a kind of counter that a player may have. They're not
//     associated with any specific permanents.
//   [2024-06-07] If an effect says you get one or more {E}, you get that many energy counters. To
//     pay one or more {E}, you lose that many energy counters. You can't pay more energy counters
//     than you have. Any effects that interact with counters a player gets, has, or loses can
//     interact with energy counters.
//   [2024-06-07] If a permanent returned to the battlefield with unearth would leave the
//     battlefield for any reason, it's exiled instead—unless the spell or ability that's causing
//     the permanent to leave the battlefield is actually trying to exile it! In that case, it
//     succeeds at exiling it. If that spell or ability later returns the card to the battlefield
//     (as Static Prison might, for example), the permanent card will return to the battlefield as
//     a new object with no relation to its previous existence. The unearth effects will no longer
//     apply to it.
//   [2024-06-07] Unearth grants haste to the permanent that's returned to the battlefield (even if
//     it's not a creature card). However, neither of the "exile" abilities is granted to that
//     permanent. If that permanent loses all its abilities, it will still be exiled at the
//     beginning of the next end step, and if it would leave the battlefield, it is still exiled
//     instead.
//   [2024-06-07] If a spell or ability with one or more targets states that you "may pay" some
//     amount of {E}, and each permanent that it targets has become an illegal target, the spell or
//     ability won't resolve. You can't pay any {E} even if you want to.
//   [2024-06-07] {E} is the energy symbol. It represents one energy counter.
//   [2024-06-07] At the beginning of the next end step, a permanent returned to the battlefield
//     with unearth is exiled. This is a delayed triggered ability, and it can be countered by
//     effects that counter triggered abilities. If the ability is countered, the permanent will
//     stay on the battlefield and the delayed triggered ability won't trigger again. However, the
//     replacement effect will still exile the permanent if it eventually leaves the battlefield.
//   [2024-06-07] Some spells and abilities that give you {E} may require targets. If each target
//     chosen is an illegal target as that spell or ability tries to resolve, it won't resolve. You
//     won't get any {E}.
//   [2024-06-07] Energy counters aren't mana. They don't go away as steps, phases, and turns end,
//     and effects that add mana "of any type" can't give you energy counters.
//   [2024-06-07] Some triggered abilities state that you "may pay" a certain amount of {E}. You
//     can't pay that amount multiple times to multiply the effect. You simply choose whether or
//     not to pay that amount of {E} as the ability resolves.
//   [2024-06-07] Keep track of how many energy counters each player has. Potential ways to track
//     this include writing theme down on paper or using dice, but any method that is clear and
//     mutually agreeable is fine. (At higher levels of tournament play, dice may not be allowed
//     for tracking counters that players have.)
//   [2024-06-07] Activating a card's unearth ability isn't the same as casting that card. The
//     unearth ability is put on the stack, but the card is not. Spells and abilities that interact
//     with activated abilities will interact with unearth, but spells and abilities that interact
//     with spells (such as Flare of Denial) will not.

const ATTACK = "Whenever you attack, other creatures you control get +2/+2 and gain indestructible until end of turn.";
const UNEARTH =
  "Unearth—Pay eight {E}. (Pay eight energy counters: Return this card from your graveyard to the battlefield. It gains haste. Exile it at the beginning of the next end step or if it would leave the battlefield. Unearth only as a sorcery.)";

const OTHERS = { type: "creature", controlledBy: "you" } as const;

export default defineCard({
  name: "Salvation Colossus",
  manaCost: "{6}{W}{W}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 9,
  toughness: 9,
  keywords: ["flying", "vigilance", "trample"],
  text: `Flying, vigilance, trample\n${ATTACK}\n${UNEARTH}`,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt-all", filter: OTHERS, power: 2, toughness: 2, duration: "end-of-turn", exceptSource: true },
          {
            kind: "grant-keyword-all",
            filter: OTHERS,
            keyword: "indestructible",
            duration: "end-of-turn",
            exceptSource: true,
          },
        ],
      },
      resolve: null,
      text: ATTACK,
    },
  ],
  // Unearth (rule 702.84a) whose cost is eight energy rather than mana: the
  // `unearth` helper's ability, paid with `payEnergy`.
  activated: [{ ...unearth(""), cost: { mana: null, tap: false, payEnergy: 8 }, text: UNEARTH }],
});
