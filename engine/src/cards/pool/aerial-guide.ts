import { defineCard } from "../define.js";

export default defineCard({
  name: "Aerial Guide",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Drake"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nWhenever this creature attacks, another target attacking creature gains flying until end of turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "other", of: { kind: "permanent", filter: { type: "creature", attacking: true } } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: "Whenever this creature attacks, another target attacking creature gains flying until end of turn.",
    },
  ],
});
