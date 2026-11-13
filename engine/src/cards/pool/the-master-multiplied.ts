import { defineCard } from "../define.js";
import { myriad } from "../helpers.js";

// - "Can't cause you to sacrifice or exile" is a `be-caused` of `by:
//   "own-triggered"`: while a triggered ability its controller controls
//   resolves (myriad's end-of-combat exile, a "sacrifice it at the next end
//   step" delayed trigger), their creature tokens can't be sacrificed or
//   exiled by it. Their tokens then stay, attacking no more once combat ends.
// - The legend rule doesn't apply to its controller's creature tokens (its
//   ruling: a token and a nontoken legend of one name both stay too).

const MYRIAD =
  "Myriad (Whenever this creature attacks, for each opponent other than defending player, you may create a token copy that's tapped and attacking that player or a planeswalker they control. Exile the tokens at end of combat.)";
const LEGEND = 'The "legend rule" doesn\'t apply to creature tokens you control.';
const SPARED = "Triggered abilities you control can't cause you to sacrifice or exile creature tokens you control.";

export default defineCard({
  name: "The Master, Multiplied",
  manaCost: "{4}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Time Lord", "Rogue"],
  power: 4,
  toughness: 3,
  text: `${MYRIAD}\n${LEGEND}\n${SPARED}`,
  triggered: [myriad()],
  static: [
    {
      affects: { scope: "filter", filter: { controlledBy: "you", token: true, type: "creature" } },
      legendRuleOff: true,
      text: LEGEND,
    },
    {
      affects: { scope: "self" },
      prohibits: [
        { act: "be-caused", who: "you", what: "sacrifice", by: "own-triggered", object: { type: "creature", token: true } },
        { act: "be-caused", who: "you", what: "exile", by: "own-triggered", object: { type: "creature", token: true } },
      ],
      text: SPARED,
    },
  ],
});
