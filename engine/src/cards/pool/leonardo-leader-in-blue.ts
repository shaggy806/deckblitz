import { defineCard } from "../define.js";

// EDHREC rank 16559.
//
// Rulings:
//   [2026-01-27] If a creature spell's sneak cost was paid, the creature it becomes enters tapped
//     and attacking the same player, planeswalker, or battle as the creature that was returned to
//     its owner's hand to pay its sneak cost. This is a rule specific to sneak; in other cases,
//     when a creature is put onto the battlefield attacking, that creature's controller chooses
//     which player, planeswalker, or battle it's attacking.
//   [2026-01-27] Spells can only be cast for their sneak costs any time you could play an instant
//     during the declare blockers step on your turn (after your opponent has decided whether to
//     block).
//   [2026-01-27] Although a creature put onto the battlefield this way is attacking, it was never
//     declared as an attacking creature. Abilities that trigger whenever a creature attacks won't
//     trigger when that creature enters attacking.


const ENTER_TEXT =
  "When Leonardo enters, if his sneak cost was paid, creatures you control get +2/+0 until end of turn.";
const FIRST_STRIKE_TEXT = "{1}{W}: Leonardo gains first strike until end of turn.";

// "If his sneak cost was paid" is an intervening if (rule 603.4): he was cast
// for it (Turncoat Kunoichi's `castVia: "sneak"`), asked as he enters and
// again as the ability resolves. The +2/+0 reaches the creatures you control
// as it resolves (rule 611.2c), Leonardo among them.
export default defineCard({
  name: "Leonardo, Leader in Blue",
  manaCost: "{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Ninja", "Turtle"],
  power: 2,
  toughness: 1,
  sneak: { cost: "{3}{W}{W}" },
  text: `Sneak {3}{W}{W} (You may cast this spell for {3}{W}{W} if you also return an unblocked attacker you control to hand during the declare blockers step. He enters tapped and attacking.)\n${ENTER_TEXT}\n${FIRST_STRIKE_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "first-strike", duration: "end-of-turn" },
      resolve: null,
      text: FIRST_STRIKE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { castVia: "sneak" } },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 2,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
