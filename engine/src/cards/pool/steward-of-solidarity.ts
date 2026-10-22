import { defineCard } from "../define.js";

// EDHREC rank 24847. Hour of Devastation. Exert is part of the cost (rule
// 701.43).
export default defineCard({
  name: "Steward of Solidarity",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 2,
  text: "{T}, Exert this creature: Create a 1/1 white Warrior creature token with vigilance. (An exerted creature won't untap during your next untap step.)",
  activated: [
    {
      cost: { mana: null, tap: true, exertSelf: true },
      targets: [],
      effect: { kind: "create-token", token: "Warrior Token (Vigilance)", count: 1 },
      resolve: null,
      text: "{T}, Exert this creature: Create a 1/1 white Warrior creature token with vigilance.",
    },
  ],
});
