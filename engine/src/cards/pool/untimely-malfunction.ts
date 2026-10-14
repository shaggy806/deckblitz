import { defineCard } from "../define.js";

const DESTROY_MODE = "Destroy target artifact.";
const CHANGE_MODE = "Change the target of target spell or ability with a single target.";
const BLOCK_MODE = "One or two target creatures can't block this turn.";

export default defineCard({
  name: "Untimely Malfunction",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `Choose one —\n• ${DESTROY_MODE}\n• ${CHANGE_MODE}\n• ${BLOCK_MODE}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      { text: DESTROY_MODE, targets: ["artifact"], effect: { kind: "destroy", target: 0 } },
      {
        text: CHANGE_MODE,
        targets: [{ kind: "stack", spells: "any", abilities: true, singleTarget: true }],
        effect: { kind: "change-targets", target: 0, how: "change" },
      },
      {
        text: BLOCK_MODE,
        // One or two: a first creature, then up to one other.
        targets: ["creature", { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } }],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "restrict", target: 0, restrictions: ["cant-block"] },
            { kind: "restrict", target: 1, restrictions: ["cant-block"] },
          ],
        },
      },
    ],
  },
});
