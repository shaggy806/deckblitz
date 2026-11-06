import { defineCard } from "../define.js";
import { entersTappedStatic } from "../helpers.js";

// Star Trek Commander (TRC). "Commanders you control" are the commanders on
// the battlefield under your control, anyone's; with none, X is 0.

const THREE_TEXT = "{T}: Add three mana of any one color.";
const X_TEXT = "{T}: Add X mana of any one color, where X is the greatest mana value among commanders you control.";

export default defineCard({
  name: "Command Chair",
  manaCost: "{6}",
  colors: [],
  types: ["artifact"],
  text: `This artifact enters tapped.\n${THREE_TEXT}\n${X_TEXT}`,
  static: [entersTappedStatic("Command Chair")],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 3 },
      resolve: null,
      text: THREE_TEXT,
    },
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: { aggregate: "max", of: "mana-value", filter: { isCommander: true, controlledBy: "you" } },
      },
      resolve: null,
      text: X_TEXT,
    },
  ],
});
