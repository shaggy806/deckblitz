import { defineCard } from "../define.js";

// "For every three cards in your graveyard" is the graveyard's size divided
// by three, rounded down (`half` with `fraction: 3`), read as the spell
// resolves — a flashback cast is on the stack then, not in the graveyard.
export default defineCard({
  name: "Recursive Recruitment",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  types: ["sorcery"],
  text: "Create two 2/2 colorless Wizard Soldier creature tokens named Cadet. If this spell was cast from a graveyard, put a +1/+1 counter on each of them for every three cards in your graveyard.\nFlashback {6}{U}{B} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  flashback: { cost: "{6}{U}{B}" },
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Cadet", count: 2 },
      {
        kind: "conditional",
        condition: { kind: "source", filter: { castFrom: "graveyard" } },
        then: {
          kind: "add-counter-all",
          filter: { thisWay: "created" },
          counter: "+1/+1",
          amount: { half: { graveyardSize: "you" }, round: "down", fraction: 3 },
        },
      },
    ],
  },
});
