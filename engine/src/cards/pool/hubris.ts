import { defineCard } from "../define.js";

// The creature and its Auras leave together, one instruction (rule 603.10a):
// the Auras are read as attached to the target (`attachedToTarget`) before
// anything moves. The target illegal as it resolves, nothing returns (608.2b).
export default defineCard({
  name: "Hubris",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return target creature and all Auras attached to it to their owners' hands.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "return-to-hand-all", filter: { subtype: "Aura", attachedToTarget: 0 } },
      { kind: "return-to-hand", target: 0 },
    ],
  },
});
