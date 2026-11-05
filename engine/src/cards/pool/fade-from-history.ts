import { defineCard } from "../define.js";

export default defineCard({
  name: "Fade from History",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Each player who controls an artifact or enchantment creates a 2/2 green Bear creature token. Then destroy all artifacts and enchantments.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "for-each-player",
        who: "each-player",
        whoIf: {
          kind: "of-player",
          player: "that-player",
          condition: { kind: "controls", filter: { typesAnyOf: ["artifact", "enchantment"] }, atLeast: 1 },
        },
        effect: { kind: "create-token", token: "Bear Token", count: 1, who: "that-player" },
      },
      { kind: "destroy-all", filter: { typesAnyOf: ["artifact", "enchantment"] } },
    ],
  },
});
