import { defineCard } from "../define.js";

export default defineCard({
  name: "Snuff Out",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "If you control a Swamp, you may pay 4 life rather than pay this spell's mana cost.\nDestroy target nonblack creature. It can't be regenerated.",
  alternativeCost: {
    mana: "{0}",
    payLife: 4,
    condition: { kind: "controls", filter: { subtype: "Swamp" }, atLeast: 1 },
  },
  targets: ["nonblack-creature"],
  effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
});
