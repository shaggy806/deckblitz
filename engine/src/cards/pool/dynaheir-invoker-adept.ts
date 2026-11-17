import { defineCard } from "../define.js";

// Commander Legends: Battle for Baldur's Gate. EDHREC rank 13626.
//
// Rulings:
//   Dynaheir doesn't actually grant haste to creatures you control, nor does it let you attack
//     with them as though they had haste.
//   The delayed triggered ability doesn't trigger if you activate a mana ability that costs four
//     or more mana to activate.
//
// The second ability lets its controller pay {T} and {Q} costs of the other creatures they
// control that came under their control this turn (rule 302.6); it gives no haste. The third
// sets up a delayed triggered ability (rule 603.7) watching its controller's next ability that
// isn't a mana ability, with four or more mana spent on its own cost (`manaSpentAtLeast` — the
// mana that paid it, rules 602.2b, 601.2h), `once` (603.7b), lapsing as the turn ends — Pit
// Automaton's shape. An ability paid for with less neither fires it nor uses it up. The copy
// goes on the stack above the ability and resolves first (rule 707.10).

const SECOND = "You may activate abilities of other creatures you control as though those creatures had haste.";
const THIRD =
  "{T}: When you next activate an ability that isn't a mana ability this turn by spending four or more mana to activate it, copy that ability. You may choose new targets for the copy.";

export default defineCard({
  name: "Dynaheir, Invoker Adept",
  manaCost: "{1}{U}{R}{W}",
  colors: ["U", "R", "W"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Wizard"],
  power: 4,
  toughness: 4,
  keywords: ["haste"],
  text: `Haste\n${SECOND}\n${THIRD}`,
  static: [
    {
      affects: { scope: "self" },
      activateAsThoughHaste: { type: "creature", isSource: false },
      text: SECOND,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { whenever: { on: "activates-ability", who: "you", manaSpentAtLeast: 4 }, once: true },
        effect: { kind: "copy-ability", target: "trigger-ability", newTargets: true },
        text: "Copy that ability. You may choose new targets for the copy.",
      },
      resolve: null,
      text: THIRD,
    },
  ],
});
