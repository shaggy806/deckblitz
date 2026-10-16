import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 11616. Baseball Bat's enters attach, Dragoon's Lance's
// your-turn flying.

const ENTERS = "When this Equipment enters, attach it to target creature you control.";
const FLYING = "During your turn, equipped creature has flying.";

export default defineCard({
  name: "Hookblade",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ENTERS}\nEquipped creature gets +1/+0.\n${FLYING}\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0, attachment: "source" },
      resolve: null,
      text: ENTERS,
    },
  ],
  static: [
    { affects: { scope: "attached" }, grantPt: [1, 0], text: "Equipped creature gets +1/+0." },
    { affects: { scope: "attached" }, condition: { kind: "your-turn" }, grantKeywords: ["flying"], text: FLYING },
  ],
  activated: [equip("{2}")],
});
