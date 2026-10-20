import { defineCard } from "../define.js";

// Kaldheim (KHM). EDHREC rank 25058.
export default defineCard({
  name: "Tuskeri Firewalker",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Berserker"],
  power: 3,
  toughness: 2,
  text: "Boast — {1}: Exile the top card of your library. You may play that card this turn. (Activate only if this creature attacked this turn and only once each turn.)",
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Boast — {1}: Exile the top card of your library. You may play that card this turn.",
      boast: true,
    },
  ],
});
