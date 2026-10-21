import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 8746. Fallout. "Equipped creature" in the upkeep effect is the
// `"attached"` ref; the keyword counter is chosen as it resolves (The Night of
// the Doctor's modal shape).

const UPKEEP =
  "At the beginning of your upkeep, you may pay {E}. If you do, untap equipped creature, then put your choice of a menace, trample, or lifelink counter on it.";
const STATIC_TEXT = "Equipped creature gets +3/+3 and doesn't untap during its controller's untap step.";

export default defineCard({
  name: "T-45 Power Armor",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `When this Equipment enters, you get {E}{E} (two energy counters).\n${STATIC_TEXT}\n${UPKEEP}\nEquip {3}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 2 },
      resolve: null,
      text: "When this Equipment enters, you get {E}{E} (two energy counters).",
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {E} to untap equipped creature and put a menace, trample, or lifelink counter on it?",
        costEnergy: 1,
        effect: {
          kind: "sequence",
          effects: [
            { kind: "untap", target: "attached" },
            {
              kind: "modal",
              minModes: 1,
              maxModes: 1,
              modes: [
                { text: "Menace counter", effect: { kind: "add-counter", target: "attached", counter: "menace", amount: 1 } },
                { text: "Trample counter", effect: { kind: "add-counter", target: "attached", counter: "trample", amount: 1 } },
                { text: "Lifelink counter", effect: { kind: "add-counter", target: "attached", counter: "lifelink", amount: 1 } },
              ],
            },
          ],
        },
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [3, 3],
      restrictions: ["doesnt-untap"],
      text: STATIC_TEXT,
    },
  ],
  activated: [equip("{3}")],
});
