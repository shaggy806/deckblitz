import { defineCard } from "../define.js";

export default defineCard({
  name: "Disarm",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Unattach all Equipment from target creature.",
  targets: ["creature"],
  effect: {
    kind: "for-each-permanent",
    filter: { subtype: "Equipment", attachedToTarget: 0 },
    simultaneous: true,
    effect: { kind: "unattach", target: 0 },
  },
});
