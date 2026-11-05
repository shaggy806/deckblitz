import { defineCard } from "../define.js";
import type { TriggeredAbility } from "../../abilities.js";

// EDHREC rank 14937.
//
// Rulings:
//   [2026-06-29] If you use the first ability of Bard's Company to cast it as though it had flash,
//     you must control a Human only as you begin the casting process and put Bard's Company on the
//     stack.
//
// The conditional flash is `flashIf` (read as the cast begins, rule 601.3d —
// Hungering Yeti). Recruit is Esgaroth Garrison's draw, discard, then a token
// if the card discarded was a nonland card.
const PUMP_TEXT = "Other creatures you control get +1/+1.";
const RECRUIT_TEXT =
  "Whenever this creature enters or attacks, recruit. (Draw a card, then discard a card. If you discarded a nonland card, create a 1/1 white Human Soldier creature token.)";

const recruit = (on: "enters-battlefield" | "attacks"): TriggeredAbility => ({
  trigger: { on, who: "self" },
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 1 },
      { kind: "discard", target: "you", amount: 1 },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "discarded", filter: { notTypes: ["land"] } },
        then: { kind: "create-token", token: "Human Soldier Token", count: 1 },
      },
    ],
  },
  resolve: null,
  text: RECRUIT_TEXT,
});

export default defineCard({
  name: "Bard's Company",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Human", "Citizen"],
  power: 2,
  toughness: 3,
  flashIf: { condition: { kind: "controls", filter: { subtype: "Human" }, atLeast: 1 } },
  text: `You may cast this spell as though it had flash if you control a Human.\n${PUMP_TEXT}\n${RECRUIT_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true },
      grantPt: [1, 1],
      text: PUMP_TEXT,
    },
  ],
  triggered: [recruit("enters-battlefield"), recruit("attacks")],
});
