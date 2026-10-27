import { defineCard } from "../define.js";

export default defineCard({
  name: "Rouse",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "If you control a Swamp, you may pay 2 life rather than pay this spell's mana cost.\nTarget creature gets +2/+0 until end of turn.",
  alternativeCost: {
    mana: "{0}",
    payLife: 2,
    condition: { kind: "controls", filter: { type: "land", subtype: "Swamp" }, atLeast: 1 },
  },
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
});
