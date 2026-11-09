import { defineCard } from "../define.js";

// EDHREC rank 12624.
export default defineCard({
  name: "Icewrought Sentry",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental", "Soldier"],
  power: 2,
  toughness: 3,
  keywords: ["vigilance"],
  text: "Vigilance\nWhenever this creature attacks, you may pay {1}{U}. When you do, tap target creature an opponent controls.\nWhenever you tap an untapped creature an opponent controls, this creature gets +2/+1 until end of turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1}{U} to tap target creature an opponent controls?",
        cost: "{1}{U}",
        effect: {
          kind: "reflexive-trigger",
          targets: ["creature-an-opponent-controls"],
          text: "When you do, tap target creature an opponent controls.",
          effect: { kind: "tap", target: 0 },
        },
      },
      resolve: null,
      text: "Whenever this creature attacks, you may pay {1}{U}. When you do, tap target creature an opponent controls.",
    },
    {
      trigger: { on: "becomes-tapped", who: "opponent", filter: { type: "creature" }, by: "you" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever you tap an untapped creature an opponent controls, this creature gets +2/+1 until end of turn.",
    },
  ],
});
