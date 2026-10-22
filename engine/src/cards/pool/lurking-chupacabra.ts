import { defineCard } from "../define.js";

// EDHREC rank 25301.

export default defineCard({
  name: "Lurking Chupacabra",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Beast", "Horror"],
  power: 2,
  toughness: 3,
  text: "Whenever a creature you control explores, target creature an opponent controls gets -2/-2 until end of turn.",
  triggered: [
    {
      trigger: { on: "explores", who: "you", filter: { type: "creature" } },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "modify-pt", target: 0, power: -2, toughness: -2, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever a creature you control explores, target creature an opponent controls gets -2/-2 until end of turn.",
    },
  ],
});
