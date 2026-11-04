import { defineCard } from "../define.js";

const ENTER_TEXT = "This artifact enters tapped.";
const MANA_TEXT = "{T}: Add X mana of any one color, where X is the greatest number of creatures you control that have a creature type in common.";

export default defineCard({
  name: "White Lotus Tile",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: `${ENTER_TEXT}\n${MANA_TEXT}`,
  static: [
    { affects: { scope: "self" }, replacement: { event: "enters-battlefield", tapped: true }, text: ENTER_TEXT },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: { aggregate: "greatest-shared-creature-type", filter: { type: "creature", controlledBy: "you" } },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
