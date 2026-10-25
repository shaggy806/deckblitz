import { defineCard } from "../define.js";

export default defineCard({
  name: "Hellion Eruption",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Sacrifice all creatures you control, then create that many 4/4 red Hellion creature tokens.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "sacrifice-all", who: "you", filter: { type: "creature" } },
      { kind: "create-token", token: "Hellion Token", count: { thisWay: "sacrificed", who: "you" } },
    ],
  },
});
