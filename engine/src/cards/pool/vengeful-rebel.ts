import { defineCard } from "../define.js";

// EDHREC rank 28566.

export default defineCard({
  name: "Vengeful Rebel",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Aetherborn", "Warrior"],
  power: 3,
  toughness: 2,
  text: "Revolt — When this creature enters, if a permanent left the battlefield under your control this turn, target creature an opponent controls gets -3/-3 until end of turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "modify-pt", target: 0, power: -3, toughness: -3, duration: "end-of-turn" },
      resolve: null,
      text: "Revolt — When this creature enters, if a permanent left the battlefield under your control this turn, target creature an opponent controls gets -3/-3 until end of turn.",
      condition: { kind: "turn-history", what: "left" },
    },
  ],
});
