import { defineCard } from "../define.js";

// EDHREC rank 10382.
//
// Increasing Devotion's shape: the counter count is 10 when this spell was
// cast from a graveyard (flashback), 5 otherwise.

export default defineCard({
  name: "Increasing Savagery",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  flashback: { cost: "{5}{G}{G}" },
  text: "Put five +1/+1 counters on target creature. If this spell was cast from a graveyard, put ten +1/+1 counters on that creature instead.\nFlashback {5}{G}{G} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: ["creature"],
  effect: {
    kind: "add-counter",
    target: 0,
    counter: "+1/+1",
    amount: {
      ifCondition: { kind: "source", filter: { castFrom: "graveyard" } },
      then: 10,
      else: 5,
    },
  },
});
