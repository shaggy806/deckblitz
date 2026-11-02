import { defineCard } from "../define.js";

export default defineCard({
  name: "Glorious Enforcer",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 5,
  toughness: 5,
  keywords: ["flying", "lifelink"],
  text: "Flying, lifelink\nAt the beginning of each combat, if you have more life than an opponent, this creature gains double strike until end of turn.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "any" },
      condition: { kind: "player-compare", stat: "life", compare: "more", than: "an-opponent" },
      targets: [],
      resolve: null,
      effect: { kind: "grant-keyword", target: "source", keyword: "double-strike", duration: "end-of-turn" },
      text: "At the beginning of each combat, if you have more life than an opponent, this creature gains double strike until end of turn.",
    },
  ],
});
