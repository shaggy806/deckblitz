import { defineCard } from "../define.js";

// EDHREC rank 13130.

export default defineCard({
  name: "Eiganjo Exemplar",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment", "creature"],
  subtypes: ["Human", "Samurai"],
  power: 2,
  toughness: 1,
  text: "Whenever a Samurai or Warrior you control attacks alone, it gets +1/+1 until end of turn.",
  triggered: [
    {
      trigger: { on: "attacks-alone", who: "you-control", filter: { subtypes: ["Samurai", "Warrior"] } },
      targets: [],
      effect: { kind: "modify-pt", target: "trigger-object", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever a Samurai or Warrior you control attacks alone, it gets +1/+1 until end of turn.",
    },
  ],
});
