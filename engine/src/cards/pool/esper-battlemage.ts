import { defineCard } from "../define.js";

// EDHREC rank 31378.

export default defineCard({
  name: "Esper Battlemage",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: "{W}, {T}: Prevent the next 2 damage that would be dealt to you this turn.\n{B}, {T}: Target creature gets -1/-1 until end of turn.",
  activated: [
    {
      cost: { mana: "{W}", tap: true },
      targets: [],
      effect: { kind: "damage-rule", to: { players: "you" }, amount: 2 },
      resolve: null,
      text: "{W}, {T}: Prevent the next 2 damage that would be dealt to you this turn.",
    },
    {
      cost: { mana: "{B}", tap: true },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: -1, toughness: -1, duration: "end-of-turn" },
      resolve: null,
      text: "{B}, {T}: Target creature gets -1/-1 until end of turn.",
    },
  ],
});
