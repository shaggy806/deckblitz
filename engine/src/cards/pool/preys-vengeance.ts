import { defineCard } from "../define.js";

export default defineCard({
  name: "Prey's Vengeance",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  rebound: true,
  text: "Target creature gets +2/+2 until end of turn.\nRebound (If you cast this spell from your hand, exile it as it resolves. At the beginning of your next upkeep, you may cast this card from exile without paying its mana cost.)",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
});
