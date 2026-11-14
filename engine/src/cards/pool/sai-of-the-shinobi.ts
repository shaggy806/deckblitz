import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 15902.
//
// Rulings:
//   If you choose not to attach Sai of the Shinobi to a creature that enters the battlefield, or
//     if you can't (most likely because the creature has left the battlefield by the time the
//     triggered ability resolves), Sai of the Shinobi doesn't move.
const ATTACH_TEXT = "Whenever a creature you control enters, you may attach this Equipment to it.";

export default defineCard({
  name: "Sai of the Shinobi",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature gets +1/+1.\n${ATTACH_TEXT}\nEquip {2}`,
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], text: "Equipped creature gets +1/+1." }],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Attach Sai of the Shinobi to it?",
        effect: { kind: "attach", target: "trigger-object" },
      },
      resolve: null,
      text: ATTACH_TEXT,
    },
  ],
  activated: [equip("{2}")],
});
