import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 24695. Kaldheim. Valkyrie's Sword's shape.

const ENTERS_TEXT =
  "When this Equipment enters, you may pay {2}{B}. If you do, create a 2/2 black Zombie Berserker creature token, then attach this Equipment to it.";
const EQUIPPED_TEXT = "Equipped creature gets +2/+2 and has menace.";

export default defineCard({
  name: "Draugr's Helm",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ENTERS_TEXT}\n${EQUIPPED_TEXT} (It can't be blocked except by two or more creatures.)\nEquip {4}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2}{B} to create a 2/2 Zombie Berserker and attach this Equipment to it?",
        cost: "{2}{B}",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "create-token", token: "Zombie Berserker Token", count: 1 },
            { kind: "attach", target: "created", attachment: "source" },
          ],
        },
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      grantKeywords: ["menace"],
      text: EQUIPPED_TEXT,
    },
  ],
  activated: [equip("{4}")],
});
