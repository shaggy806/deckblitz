import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 11901.

const ENTER_TEXT = "When this Equipment enters, attach it to target creature you control.";
const FLY_TEXT = "Equipped creature has flying. (It can't be blocked except by creatures with flying or reach.)";

export default defineCard({
  name: "Mechanical Glider",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ENTER_TEXT}\n${FLY_TEXT}\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)`,
  activated: [equip("{2}")],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0, attachment: "source" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantKeywords: ["flying"], text: FLY_TEXT }],
});
