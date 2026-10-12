import { defineCard } from "../define.js";

export default defineCard({
  name: "Masterful Flourish",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target creature you control gets +1/+0 and gains indestructible until end of turn. (Damage and effects that say \"destroy\" don't destroy it.)",
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
    ],
  },
});
