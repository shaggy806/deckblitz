import { defineCard } from "../define.js";

// EDHREC rank 29302. Ixalan. The Huatli is checked only as it resolves (the
// ruling).

export default defineCard({
  name: "Huatli's Spurring",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target creature gets +2/+0 until end of turn. If you control a Huatli planeswalker, that creature gets +4/+0 until end of turn instead.",
  targets: ["creature"],
  effect: {
    kind: "conditional",
    condition: { kind: "controls", filter: { type: "planeswalker", subtype: "Huatli" }, atLeast: 1 },
    then: { kind: "modify-pt", target: 0, power: 4, toughness: 0, duration: "end-of-turn" },
    else: { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
  },
});
