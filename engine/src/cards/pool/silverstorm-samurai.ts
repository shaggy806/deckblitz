import { defineCard } from "../define.js";

export default defineCard({
  name: "Silverstorm Samurai",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Fox", "Samurai"],
  power: 3,
  toughness: 3,
  keywords: ["flash"],
  text: "Flash\nBushido 1 (Whenever this creature blocks or becomes blocked, it gets +1/+1 until end of turn.)",
  triggered: [
    {
      trigger: { on: "blocks", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Bushido 1 (Whenever this creature blocks or becomes blocked, it gets +1/+1 until end of turn.)",
    },
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Bushido 1 (Whenever this creature blocks or becomes blocked, it gets +1/+1 until end of turn.)",
    },
  ],
});
