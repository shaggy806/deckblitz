import { defineCard } from "../define.js";

const ATTACK_TEXT =
  "Whenever this creature attacks, you may sacrifice another creature. If you do, this creature gains double strike until end of turn.";

export default defineCard({
  name: "Ragefire Hellkite",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 5,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "creature" }, exceptSource: true, text: "Sacrifice another creature" }],
        ifDid: { kind: "grant-keyword", target: "source", keyword: "double-strike", duration: "end-of-turn" },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
