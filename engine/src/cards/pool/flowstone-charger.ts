import { defineCard } from "../define.js";

export default defineCard({
  name: "Flowstone Charger",
  manaCost: "{2}{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 2,
  toughness: 5,
  text: "Whenever this creature attacks, it gets +3/-3 until end of turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 3, toughness: -3, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever this creature attacks, it gets +3/-3 until end of turn.",
    },
  ],
});
