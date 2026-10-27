import { defineCard } from "../define.js";

// The target spell's controller picks one of the two outcomes as this resolves
// (Dwarven Driller's `choices` shape); "them" is `"that-player"`, the chooser.
export default defineCard({
  name: "Molten Influence",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Counter target instant or sorcery spell unless its controller has Molten Influence deal 4 damage to them.",
  targets: [{ kind: "spell", filter: { typesAnyOf: ["instant", "sorcery"] } }],
  effect: {
    kind: "each-player-may",
    who: { controllerOfTarget: 0 },
    choices: [
      {
        text: "Have Molten Influence deal 4 damage to you.",
        effect: { kind: "damage", amount: 4, who: "that-player" },
      },
      { text: "Let Molten Influence counter your spell.", effect: { kind: "counter", target: 0 } },
    ],
  },
});
