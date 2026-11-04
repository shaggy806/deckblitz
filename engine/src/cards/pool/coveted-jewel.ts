import { defineCard } from "../define.js";

// EDHREC rank 1262. Commander 2018.
//
// Rulings:
//   A creature attacking a planeswalker you control won't cause Coveted Jewel's last ability to
//     trigger.
//   Coveted Jewel's last ability triggers after you declare blockers (or declare no blockers at
//     all) if any attacking creatures are unblocked. It doesn't matter if some attacking creatures
//     were blocked.
//   Coveted Jewel's last ability resolves after blockers are chosen but before combat damage is
//     dealt.

const ENTERS_TEXT = "When this artifact enters, draw three cards.";
const MANA_TEXT = "{T}: Add three mana of any one color.";
const STOLEN_TEXT =
  "Whenever one or more creatures an opponent controls attack you and aren't blocked, that player draws three cards and gains control of this artifact. Untap it.";

export default defineCard({
  name: "Coveted Jewel",
  manaCost: "{6}",
  colors: [],
  types: ["artifact"],
  text: `${ENTERS_TEXT}\n${MANA_TEXT}\n${STOLEN_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 3 },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 3 },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      // The attacking player is the active player: a creature that changes
      // controllers leaves combat (rule 506.4).
      trigger: { on: "attacks-player", who: "opponent", defender: "you", unblocked: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 3, who: "active-player" },
          { kind: "gain-control", target: "source", who: "active-player", untilEndOfTurn: false },
          { kind: "untap", target: "source" },
        ],
      },
      resolve: null,
      text: STOLEN_TEXT,
    },
  ],
});
