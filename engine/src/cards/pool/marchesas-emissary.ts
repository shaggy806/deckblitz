import { defineCard } from "../define.js";

export default defineCard({
  name: "Marchesa's Emissary",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 2,
  keywords: ["hexproof"],
  text: "Hexproof (This creature can't be the target of spells or abilities your opponents control.)\nDethrone (Whenever this creature attacks the player with the most life or tied for most life, put a +1/+1 counter on it.)",
  triggered: [
    {
      trigger: { on: "attacks", who: "self", defenderLife: "most" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Dethrone",
    },
  ],
});
