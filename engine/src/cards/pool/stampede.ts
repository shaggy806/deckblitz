import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 22927. Every player's attacking creatures, as it
// resolves (rule 611.2c).

export default defineCard({
  name: "Stampede",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Attacking creatures get +1/+0 and gain trample until end of turn.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt-all", filter: { type: "creature", attacking: true }, power: 1, toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword-all", filter: { type: "creature", attacking: true }, keyword: "trample", duration: "end-of-turn" },
    ],
  },
});
