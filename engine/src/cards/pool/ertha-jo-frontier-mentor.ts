import { defineCard } from "../define.js";

// EDHREC rank 8417.
//
// Rulings:
//   [2024-04-12] Activated abilities contain a colon. They're generally written "[Cost]:
//     [Effect]." Some keyword abilities (such as equip) are activated abilities and will have
//     colons in their reminder text.
//   [2024-04-12] If the activated ability's cost contains a choice, such as a creature to
//     sacrifice or a number of counters to remove, the copy uses that same information. You can't
//     pay the cost again, even if you want to.
//   [2024-04-12] If the ability is modal (that is, if it says, "Choose one —" or similar), the
//     mode is copied and can't be changed.
//   [2024-04-12] The source of the copy is the same as the source of the original ability.
//   [2024-04-12] The copy made by Ertha Jo's triggered ability is created on the stack, so it's
//     not "activated."
//   [2024-04-12] The copy will have the same targets as the ability it's copying unless you choose
//     new ones. You may change any number of the targets, including all of them or none of them.
//     The new targets must be legal.
//   [2024-04-12] If an ability is linked to a second ability, copies of that ability are also
//     linked to that second ability. If the second ability refers to "the exiled card," it refers
//     to all cards exiled by the ability and the copy. For example, if one of Helvault's activated
//     abilities is copied and two cards are exiled, they both return when Helvault is put into a
//     graveyard from the battlefield.
//   [2024-04-12] If the ability divides damage or distributes counters among a number of targets,
//     the division and number of targets can't be changed. If you choose new targets, you must
//     choose the same number of targets.
//   [2024-04-12] Any choices made when the ability resolves won't have been made yet when it's
//     copied. Any such choices will be made separately when the copy resolves.

const ENTERS =
  'When Ertha Jo enters, create a 1/1 red Mercenary creature token with "{T}: Target creature you control gets +1/+0 until end of turn. Activate only as a sorcery."';
const COPY =
  "Whenever you activate an ability that targets a creature or player, copy that ability. You may choose new targets for the copy.";

export default defineCard({
  name: "Ertha Jo, Frontier Mentor",
  manaCost: "{2}{R}{W}",
  colors: ["R", "W"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Kor", "Advisor"],
  power: 2,
  toughness: 4,
  text: `${ENTERS}\n${COPY}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Mercenary Token", count: 1 },
      resolve: null,
      text: ENTERS,
    },
    {
      // Never a mana ability (none uses the stack, so none has targets). One
      // creature or player among its targets is enough; the copy is the
      // ability as it last was on the stack, so it's made even if the
      // original was countered first.
      trigger: {
        on: "activates-ability",
        who: "you",
        targets: { permanent: { type: "creature" }, player: "any" },
      },
      targets: [],
      effect: { kind: "copy-ability", target: "trigger-ability", newTargets: true },
      resolve: null,
      text: COPY,
    },
  ],
});
