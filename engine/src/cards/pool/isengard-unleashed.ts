import { defineCard } from "../define.js";

const FIRST = "Damage can't be prevented this turn. If a source you control would deal damage this turn to an opponent or a permanent an opponent controls, it deals triple that damage instead.";

export default defineCard({
  name: "Isengard Unleashed",
  manaCost: "{2}{R}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  flashback: { cost: "{4}{R}{R}{R}" },
  text: `${FIRST}\nFlashback {4}{R}{R}{R} (You may cast this card from your graveyard for its flashback cost. Then exile it.)`,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage-cant-be-prevented" },
      {
        kind: "replacement-effect",
        duration: "end-of-turn",
        replacement: {
          event: "would-deal-damage",
          source: { controlledBy: "you" },
          to: "opponent-side",
          instead: { modify: { times: 3 } },
        },
      },
    ],
  },
});
