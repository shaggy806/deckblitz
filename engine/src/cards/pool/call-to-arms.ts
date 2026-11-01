import { defineCard } from "../define.js";

// A color and an opponent chosen as it enters (`chooseOnEnter`, `choosePlayerOnEnter`),
// and the same `most-common-color` test over the chosen player's nontoken permanents in
// a static and in its state trigger (rule 603.8).

const MOST_COMMON = {
  kind: "most-common-color",
  color: "chosen",
  among: { nontoken: true, chosenPlayer: true },
  untied: true,
} as const;

const PT_TEXT = "White creatures get +1/+1 as long as the chosen color is the most common color among nontoken permanents the chosen player controls but isn't tied for most common.";
const SAC_TEXT = "When the chosen color isn't the most common color among nontoken permanents the chosen player controls or is tied for most common, sacrifice this enchantment.";

export default defineCard({
  name: "Call to Arms",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `As this enchantment enters, choose a color and an opponent.\n${PT_TEXT}\n${SAC_TEXT}`,
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  choosePlayerOnEnter: "opponent",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["W"] } },
      condition: MOST_COMMON,
      grantPt: [1, 1],
      text: PT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "state", state: { kind: "not", of: MOST_COMMON } },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
