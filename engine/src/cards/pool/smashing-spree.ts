import { defineCard } from "../define.js";

export default defineCard({
  name: "Smashing Spree",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target attacking creature gets +3/+3 and gains trample until end of turn. (It can deal excess combat damage to the player it's attacking.)",
  targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
    ],
  },
});
