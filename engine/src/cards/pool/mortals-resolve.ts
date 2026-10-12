import { defineCard } from "../define.js";

export default defineCard({
  name: "Mortal's Resolve",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature gets +1/+1 and gains indestructible until end of turn. (Damage and effects that say \"destroy\" don't destroy it.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
    ],
  },
});
