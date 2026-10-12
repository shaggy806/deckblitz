import { defineCard } from "../define.js";

export default defineCard({
  name: "Adamant Will",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature gets +2/+2 and gains indestructible until end of turn. (Damage and effects that say \"destroy\" don't destroy it.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
    ],
  },
});
