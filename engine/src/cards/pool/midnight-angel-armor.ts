import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 17592. Marvel Super Heroes Commander.
//
// Dwarven Shortsword's shape (living weapon's, rule 702.92a) with a 1/1
// white Soldier: the token enters, then the Equipment is attached to it.
const ENTERS_TEXT =
  "When this Equipment enters, create a 1/1 white Soldier creature token, then attach this Equipment to it.";
const EQUIPPED_TEXT = "Equipped creature gets +3/+3 and has flying and vigilance.";

export default defineCard({
  name: "Midnight Angel Armor",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
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
          { kind: "create-token", token: "Soldier Token", count: 1 },
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
      grantPt: [3, 3],
      grantKeywords: ["flying", "vigilance"],
      text: EQUIPPED_TEXT,
    },
  ],
  activated: [equip("{3}")],
});
