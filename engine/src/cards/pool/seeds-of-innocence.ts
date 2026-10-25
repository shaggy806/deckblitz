import { defineCard } from "../define.js";

// EDHREC rank 19640. Shatterstorm, then each player gains the total mana value
// of the artifacts destroyed this way under their control (`who: "each"`, as
// Descent of the Dragons counts its destroyed creatures per controller).

export default defineCard({
  name: "Seeds of Innocence",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Destroy all artifacts. They can't be regenerated. The controller of each of those artifacts gains life equal to its mana value.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy-all", filter: { type: "artifact" }, cantBeRegenerated: true },
      {
        kind: "gain-life",
        who: "each-player",
        amount: { thisWay: "destroyed", who: "each", sumOf: "mana-value" },
      },
    ],
  },
});
