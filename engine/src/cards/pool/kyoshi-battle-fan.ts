import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 12484. Midnight Angel Armor's shape with a 1/1 white Ally: the
// token enters as a 1/1 (the ruling), then the Equipment is attached to it.

const ENTERS_TEXT =
  "When this Equipment enters, create a 1/1 white Ally creature token, then attach this Equipment to it.";
const EQUIPPED_TEXT = "Equipped creature gets +1/+0.";

export default defineCard({
  name: "Kyoshi Battle Fan",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ENTERS_TEXT}\n${EQUIPPED_TEXT}\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)`,
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
  static: [{ affects: { scope: "attached" }, grantPt: [1, 0], text: EQUIPPED_TEXT }],
  activated: [equip("{2}")],
});
