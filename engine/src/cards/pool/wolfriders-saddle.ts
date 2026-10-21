import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// Core Set 2020. Midnight Angel Armor's shape: the Wolf enters as a 2/2, then
// the Equipment is attached to it, with nothing in between (the rulings).
const ENTERS_TEXT =
  "When this Equipment enters, create a 2/2 green Wolf creature token, then attach this Equipment to it.";
const EQUIPPED_TEXT = "Equipped creature gets +1/+1 and can't be blocked by more than one creature.";

export default defineCard({
  name: "Wolfrider's Saddle",
  manaCost: "{3}{G}",
  colors: ["G"],
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
          { kind: "create-token", token: "Wolf Token", count: 1 },
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
      grantPt: [1, 1],
      blockedByAtMostOne: true,
      text: EQUIPPED_TEXT,
    },
  ],
  activated: [equip("{3}")],
});
