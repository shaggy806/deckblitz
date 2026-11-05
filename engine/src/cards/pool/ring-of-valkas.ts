import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 5165. Ring of Thune's shape.
const UPKEEP_TEXT = "At the beginning of your upkeep, put a +1/+1 counter on equipped creature if it's red.";

export default defineCard({
  name: "Ring of Valkas",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature has haste. (It can attack and {T} no matter when it came under your control.)\n${UPKEEP_TEXT}\nEquip {1} ({1}: Attach to target creature you control. Equip only as a sorcery.)`,
  static: [{ affects: { scope: "attached" }, grantKeywords: ["haste"], text: "Equipped creature has haste." }],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source", filter: { attachedTo: { colors: ["R"] } } },
        then: { kind: "add-counter", target: "attached", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  activated: [equip("{1}")],
});
