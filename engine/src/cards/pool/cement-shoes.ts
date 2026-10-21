import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

const GRANT = "Equipped creature gets +3/+3 and has \"At the beginning of your end step, tap this creature.\"";
const LOCK = "Equipped creature doesn't untap during its controller's untap step.";

export default defineCard({
  name: "Cement Shoes",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${GRANT}\n${LOCK}\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [3, 3],
      grantsTriggered: [
        {
          trigger: { on: "step-begins", step: "end", who: "you" },
          targets: [],
          effect: { kind: "tap", target: "source" },
          resolve: null,
          text: "At the beginning of your end step, tap this creature.",
        },
      ],
      text: GRANT,
    },
    {
      affects: { scope: "attached" },
      restrictions: ["doesnt-untap"],
      text: LOCK,
    },
  ],
  activated: [equip("{2}")],
});
