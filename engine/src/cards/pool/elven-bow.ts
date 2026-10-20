import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// Kaldheim (KHM). EDHREC rank 17782. The {2} is paid as the trigger resolves
// (the ruling); Midnight Angel Armor's create-then-attach after it.
const ENTERS_TEXT =
  "When this Equipment enters, you may pay {2}. If you do, create a 1/1 green Elf Warrior creature token, then attach this Equipment to it.";
const EQUIPPED_TEXT = "Equipped creature gets +1/+2 and has reach.";

export default defineCard({
  name: "Elven Bow",
  manaCost: "{G}",
  colors: ["G"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ENTERS_TEXT}\n${EQUIPPED_TEXT}\nEquip {3}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2} to create a 1/1 Elf Warrior and attach this Equipment to it?",
        cost: "{2}",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "create-token", token: "Elf Warrior Token", count: 1 },
            { kind: "attach", target: "created", attachment: "source" },
          ],
        },
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 2], grantKeywords: ["reach"], text: EQUIPPED_TEXT }],
  activated: [equip("{3}")],
});
