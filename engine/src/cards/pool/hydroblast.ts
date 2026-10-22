import { defineCard } from "../define.js";

// EDHREC rank 12679. Pyroblast's mirror: either mode may target *any* spell
// or permanent, the colour checked only as Hydroblast resolves (the
// 2016-06-08 ruling); the mode is chosen before targets (the 2004-10-04
// ruling), which is what `castModal` does.
export default defineCard({
  name: "Hydroblast",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Choose one —\n• Counter target spell if it's red.\n• Destroy target permanent if it's red.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Counter target spell if it's red.",
        targets: ["spell"],
        effect: {
          kind: "conditional",
          condition: { kind: "target", index: 0, filter: { colors: ["R"] } },
          then: { kind: "counter", target: 0 },
        },
      },
      {
        text: "Destroy target permanent if it's red.",
        targets: ["permanent"],
        effect: {
          kind: "conditional",
          condition: { kind: "target", index: 0, filter: { colors: ["R"] } },
          then: { kind: "destroy", target: 0 },
        },
      },
    ],
  },
});
