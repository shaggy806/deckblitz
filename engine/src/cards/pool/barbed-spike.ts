import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// Midnight Angel Armor's shape: the token is made even if the Equipment
// can't be attached (the first ruling).
const ENTERS_TEXT =
  "When this Equipment enters, create a 1/1 colorless Thopter artifact creature token with flying, then attach this Equipment to it.";
const EQUIPPED_TEXT = "Equipped creature gets +1/+0.";

export default defineCard({
  name: "Barbed Spike",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ENTERS_TEXT}\n${EQUIPPED_TEXT}\nEquip {2}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Thopter Token", count: 1 },
          { kind: "attach", target: "created", attachment: "source" },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 0], text: EQUIPPED_TEXT }],
  activated: [equip("{2}")],
});
