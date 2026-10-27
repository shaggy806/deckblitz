import type { StaticCondition } from "../define.js";
import { defineCard } from "../define.js";
import { bushido } from "../helpers.js";

// Champions of Kamigawa (CHK). EDHREC rank 23963.
//
// Rulings:
//   [2004-12-01] The two Brothers could be controlled by different players.
//   [2013-07-01] If a third Brothers Yamazaki enters the battlefield, the legend rule will apply.
//     If one player controls more than one Brothers Yamazaki at that time, that player will have
//     to choose one and put the rest into their graveyard.
//
// "Exactly two permanents named Brothers Yamazaki on the battlefield", whoever
// controls them, is the sum of the ones you control (this one counted) and the
// ones your opponents control being 2: two of yours and none of theirs, or one
// of yours (this one) and one of theirs.

const NAMED = { name: "Brothers Yamazaki" };

const EXACTLY_TWO: StaticCondition = {
  kind: "any",
  of: [
    {
      kind: "all",
      of: [
        { kind: "controls", filter: NAMED, atLeast: 2, countsSelf: true },
        { kind: "not", of: { kind: "controls", filter: NAMED, atLeast: 3, countsSelf: true } },
        { kind: "not", of: { kind: "opponents-control-total", filter: NAMED, atLeast: 1 } },
      ],
    },
    {
      kind: "all",
      of: [
        { kind: "not", of: { kind: "controls", filter: NAMED, atLeast: 2, countsSelf: true } },
        { kind: "opponents-control-total", filter: NAMED, atLeast: 1 },
        { kind: "not", of: { kind: "opponents-control-total", filter: NAMED, atLeast: 2 } },
      ],
    },
  ],
};

const LEGEND_TEXT =
  'If there are exactly two permanents named Brothers Yamazaki on the battlefield, the "legend rule" doesn\'t apply to them.';
const PUMP_TEXT = "Each other creature named Brothers Yamazaki gets +2/+2 and has haste.";

export default defineCard({
  name: "Brothers Yamazaki",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Samurai"],
  power: 2,
  toughness: 1,
  text: `Bushido 1 (Whenever this creature blocks or becomes blocked, it gets +1/+1 until end of turn.)\n${LEGEND_TEXT}\n${PUMP_TEXT}`,
  triggered: [...bushido(1)],
  static: [
    {
      affects: { scope: "filter", filter: NAMED },
      condition: EXACTLY_TWO,
      legendRuleOff: true,
      text: LEGEND_TEXT,
    },
    {
      affects: { scope: "filter", filter: { type: "creature", ...NAMED }, excludeSelf: true },
      grantPt: [2, 2],
      grantKeywords: ["haste"],
      text: PUMP_TEXT,
    },
  ],
});
