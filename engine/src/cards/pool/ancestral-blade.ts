import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 12784. Midnight Angel Armor's shape: the Soldier, then the attach,
// in one resolution (no player acts between them — the ruling).

const ENTERS_TEXT = "When this Equipment enters, create a 1/1 white Soldier creature token, then attach this Equipment to it.";
const EQUIPPED_TEXT = "Equipped creature gets +1/+1.";

export default defineCard({
  name: "Ancestral Blade",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ENTERS_TEXT}\n${EQUIPPED_TEXT}\nEquip {1} ({1}: Attach to target creature you control. Equip only as a sorcery.)`,
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
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], text: EQUIPPED_TEXT }],
  activated: [equip("{1}")],
});
