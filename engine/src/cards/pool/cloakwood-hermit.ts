import { defineCard } from "../define.js";

// EDHREC rank 8556.
// Far Traveler's granted end-step trigger, with Macabre Reconstruction's
// "a creature card was put into your graveyard from anywhere this turn"
// (`turn-history` "descended", tokens aren't cards) as an intervening if.
//
// Rulings:
//   [2022-06-10] Once the game begins, your two commanders are tracked separately. If you cast
//     one, you won’t have to pay an additional {2} the first time you cast the other. A player
//     loses the game after having been dealt 21 combat damage from any one of them, not from both
//     of them combined (although your Background won’t usually be a creature anyway).
//   [2022-06-10] The ability Cloakwood Hermit grants triggers if you control a creature with that
//     ability as the end step begins and a creature card was put into your graveyard from anywhere
//     this turn. This is true even if no creatures had this ability at the time the creature card
//     went to the graveyard or the creature card is no longer in your graveyard as your end step
//     begins.
//   [2022-06-10] If a card refers to a commander creature you own, a Background won't usually be
//     counted or included for that effect. If another spell or ability causes your Background to
//     become a creature, however, it will be included. Any effect that refers to your commander or
//     a commander you own or control without specifying creature will apply to a Background that
//     is your commander, as appropriate.
//   [2022-06-10] If your Commander deck has two commanders, you can include only cards whose own
//     color identities are also found in your commanders’ combined color identities.
//   [2022-06-10] Both commanders start in the command zone, and the remaining 98 cards (or 58
//     cards in a Commander Draft game) of your deck are shuffled to become your library.
//   [2022-06-10] Notably, this means that if your commander creature dies and you choose to return
//     it to the command zone from the graveyard, then cast it again the same turn, the ability
//     granted to it by Cloakwood Hermit will trigger at the beginning of that turn's end step.
//   [2022-06-10] You can choose two commanders that are the same color or colors.
//   [2022-06-10] If something refers to your commander while you have two commanders, it refers to
//     one of them of your choice. If you are instructed to perform an action on your commander
//     (e.g. put it from the command zone into your hand due to Command Beacon), you choose one of
//     your commanders at the time the effect happens.
//   [2022-06-10] If you control a Background that grants an ability to commander creatures you
//     own, and you own more than one commander creature, each of them will have that ability.
//   [2022-06-10] If your commander loses the choose a Background ability or stops being a
//     Background during the game, as appropriate, it is still your commander.
//   [2022-06-10] An effect that checks whether you control your commander is satisfied if you
//     control one or both of your two commanders.
//   [2022-06-10] Choose a Background is a variant of the partner ability. You may have two
//     commanders if one of them is a legendary creature with the choose a background ability and
//     the other is a legendary Background enchantment. Backgrounds and cards with choose a
//     Background do not interact with cards which have any other partner ability.

const GRANTED_TEXT =
  "At the beginning of your end step, if a creature card was put into your graveyard from anywhere this turn, create two tapped 1/1 green Squirrel creature tokens.";
const TEXT = `Commander creatures you own have "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Cloakwood Hermit",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  subtypes: ["Background"],
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", isCommander: true, ownedBy: "you" } },
      grantsTriggered: [
        {
          trigger: { on: "step-begins", step: "end", who: "you" },
          condition: { kind: "turn-history", what: "descended", filter: { type: "creature", token: false } },
          targets: [],
          effect: { kind: "create-token", token: "Squirrel Token", count: 2, tapped: true },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: TEXT,
    },
  ],
});
