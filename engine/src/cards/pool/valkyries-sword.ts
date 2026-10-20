import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 20901. Kaldheim.
//
// The {4}{W} is paid as the trigger resolves; if it is, the token is created
// and the Equipment attached to it at once (the ruling) — Midnight Angel
// Armor's shape behind Liliana's Devotee's "you may pay".

const ENTERS_TEXT =
  "When this Equipment enters, you may pay {4}{W}. If you do, create a 4/4 white Angel Warrior creature token with flying and vigilance, then attach this Equipment to it.";
const EQUIPPED_TEXT = "Equipped creature gets +2/+1.";

export default defineCard({
  name: "Valkyrie's Sword",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ENTERS_TEXT}\n${EQUIPPED_TEXT}\nEquip {3}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {4}{W} to create a 4/4 Angel Warrior and attach this Equipment to it?",
        cost: "{4}{W}",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "create-token", token: "Angel Warrior Token (Flying, Vigilance)", count: 1 },
            { kind: "attach", target: "created", attachment: "source" },
          ],
        },
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 1], text: EQUIPPED_TEXT }],
  activated: [equip("{3}")],
});
