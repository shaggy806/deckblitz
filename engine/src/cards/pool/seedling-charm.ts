import { defineCard } from "../define.js";

export default defineCard({
  name: "Seedling Charm",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Choose one —\n• Return target Aura attached to a creature to its owner's hand.\n• Regenerate target green creature.\n• Target creature gains trample until end of turn.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Return target Aura attached to a creature to its owner's hand.",
        targets: [{ kind: "permanent", filter: { subtype: "Aura", attachedTo: { type: "creature" } } }],
        effect: { kind: "return-to-hand", target: 0 },
      },
      {
        text: "Regenerate target green creature.",
        targets: [{ kind: "permanent", filter: { type: "creature", colors: ["G"] } }],
        effect: { kind: "regenerate", target: 0 },
      },
      {
        text: "Target creature gains trample until end of turn.",
        targets: ["creature"],
        effect: { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
      },
    ],
  },
});
