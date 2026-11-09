import { defineCard } from "../define.js";

const ACTIVATED_TEXT =
  "{R}{W}, Exile this enchantment: Exile all creatures you control. At the beginning of the next combat, return those cards to the battlefield under their owner's control and those creatures gain haste until end of turn.";

export default defineCard({
  name: "Legion's Initiative",
  manaCost: "{R}{W}",
  colors: ["R", "W"],
  types: ["enchantment"],
  text: `Red creatures you control get +1/+0.\nWhite creatures you control get +0/+1.\n${ACTIVATED_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["R"], controlledBy: "you" } },
      grantPt: [1, 0],
      text: "Red creatures you control get +1/+0.",
    },
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["W"], controlledBy: "you" } },
      grantPt: [0, 1],
      text: "White creatures you control get +0/+1.",
    },
  ],
  activated: [
    {
      cost: { mana: "{R}{W}", tap: false, do: { kind: "exile", target: "source" } },
      targets: [],
      effect: {
        kind: "flicker",
        target: { all: { type: "creature", controlledBy: "you" } },
        returnAt: { step: "begin-combat" },
        returnText: "Return those cards to the battlefield under their owner's control and those creatures gain haste until end of turn.",
        returnThen: { kind: "grant-keyword-all", filter: { thisWay: "put-onto-battlefield" }, keyword: "haste", duration: "end-of-turn" },
      },
      resolve: null,
      text: ACTIVATED_TEXT,
    },
  ],
});
