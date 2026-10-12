import { defineCard } from "../define.js";

export default defineCard({
  name: "Malamet Brawler",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Cat", "Warrior"],
  power: 2,
  toughness: 2,
  text: "Whenever this creature attacks, target attacking creature gains trample until end of turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
      resolve: null,
      text: "Whenever this creature attacks, target attacking creature gains trample until end of turn.",
    },
  ],
});
