import { defineCard } from "../define.js";

export default defineCard({
  name: "Trained Condor",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nWhenever this creature attacks, another target creature you control gains flying until end of turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: "Whenever this creature attacks, another target creature you control gains flying until end of turn.",
    },
  ],
});
