import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

const ENTERS_TEXT =
  "When this Equipment enters, create a 1/1 white Ally creature token, then attach this Equipment to it.";
const EQUIPPED_TEXT = "During your turn, equipped creature gets +1/+1 and has first strike.";

export default defineCard({
  name: "Hook Swords",
  manaCost: "{2}{R/W}",
  colors: ["W", "R"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ENTERS_TEXT}\n${EQUIPPED_TEXT}\nEquip {3}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Ally Token", count: 1 },
          { kind: "attach", target: "created", attachment: "source" },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      condition: { kind: "your-turn" },
      grantPt: [1, 1],
      grantKeywords: ["first-strike"],
      text: EQUIPPED_TEXT,
    },
  ],
  activated: [equip("{3}")],
});
