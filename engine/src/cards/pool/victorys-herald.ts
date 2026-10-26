import { defineCard } from "../define.js";

export default defineCard({
  name: "Victory's Herald",
  manaCost: "{3}{W}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nWhenever this creature attacks, attacking creatures gain flying and lifelink until end of turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword-all", filter: { type: "creature", attacking: true }, keyword: "flying", duration: "end-of-turn" },
          { kind: "grant-keyword-all", filter: { type: "creature", attacking: true }, keyword: "lifelink", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "Whenever this creature attacks, attacking creatures gain flying and lifelink until end of turn.",
    },
  ],
});
