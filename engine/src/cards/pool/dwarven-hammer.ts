import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 13874.
//
// The {2} is paid as the trigger resolves, and the token and the attach
// follow with no one able to respond (the ruling). The token enters a 2/1.
const ETB_TEXT =
  "When this Equipment enters, you may pay {2}. If you do, create a 2/1 red Dwarf Berserker creature token, then attach this Equipment to it.";
const STATIC_TEXT = "Equipped creature gets +3/+0 and has trample.";

export default defineCard({
  name: "Dwarven Hammer",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ETB_TEXT}\n${STATIC_TEXT}\nEquip {3}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2} to create a Dwarf Berserker and attach this Equipment to it?",
        cost: "{2}",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "create-token", token: "Dwarf Berserker Token", count: 1 },
            { kind: "attach", target: "created", attachment: "source" },
          ],
        },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [3, 0],
      grantKeywords: ["trample"],
      text: STATIC_TEXT,
    },
  ],
  activated: [equip("{3}")],
});
