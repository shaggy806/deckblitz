import { defineCard } from "../define.js";

// EDHREC rank 20293.
// Makes Giant Warrior → use "5/5 White Giant Warrior Token".

export default defineCard({
  name: "Feudkiller's Verdict",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["kindred", "sorcery"],
  subtypes: ["Giant"],
  text: "You gain 10 life. Then if you have more life than an opponent, create a 5/5 white Giant Warrior creature token.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-life", amount: 10 },
      {
        kind: "conditional",
        condition: { kind: "player-compare", stat: "life", compare: "more", than: "an-opponent" },
        then: { kind: "create-token", token: "5/5 White Giant Warrior Token", count: 1 },
      },
    ],
  },
});
