import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 27660. Midnight Angel Armor's shape.

const ENTERS_TEXT =
  "When this Equipment enters, create a 2/1 black Villain creature token with menace, then attach this Equipment to it.";

export default defineCard({
  name: "HYDRA Disintegrator",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ENTERS_TEXT} (A creature with menace can't be blocked except by two or more creatures.)\nEquipped creature gets +3/+3.\nEquip {4} ({4}: Attach to target creature you control. Equip only as a sorcery.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Villain Token", count: 1 },
          { kind: "attach", target: "created", attachment: "source" },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [3, 3], text: "Equipped creature gets +3/+3." }],
  activated: [equip("{4}")],
});
