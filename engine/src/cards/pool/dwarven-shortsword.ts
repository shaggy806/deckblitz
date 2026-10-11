import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 14545.
// Makes Dwarf → "2/2 Red Dwarf Token".
//
// Living weapon's shape (rule 702.92a) with a 2/2 red Dwarf: the token
// enters, then the Equipment is attached to it; with two made (Doubling
// Season) it goes onto one.
const ENTERS_TEXT =
  "When this Equipment enters, create a 2/2 red Dwarf creature token, then attach this Equipment to it.";
const EQUIPPED_TEXT = "Equipped creature gets +1/+2.";

export default defineCard({
  name: "Dwarven Shortsword",
  manaCost: "{3}{W}",
  colors: ["W"],
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
          { kind: "create-token", token: "2/2 Red Dwarf Token", count: 1 },
          { kind: "attach", target: "created", attachment: "source" },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 2], text: EQUIPPED_TEXT }],
  activated: [equip("{2}")],
});
