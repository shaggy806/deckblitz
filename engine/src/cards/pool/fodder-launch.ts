import { defineCard } from "../define.js";

export default defineCard({
  name: "Fodder Launch",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["kindred", "sorcery"],
  subtypes: ["Goblin"],
  text: "As an additional cost to cast this spell, sacrifice a Goblin.\nTarget creature gets -5/-5 until end of turn. Fodder Launch deals 5 damage to that creature's controller.",
  additionalCost: { sacrifice: { subtype: "Goblin", controlledBy: "you" } },
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: -5, toughness: -5, duration: "end-of-turn" },
      { kind: "damage", amount: 5, toControllerOfTarget: 0 },
    ],
  },
});
