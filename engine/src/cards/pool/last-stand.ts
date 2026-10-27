import { defineCard } from "../define.js";

// EDHREC rank 19024.

export default defineCard({
  name: "Last Stand",
  manaCost: "{W}{U}{B}{R}{G}",
  colors: ["W", "U", "B", "R", "G"],
  types: ["sorcery"],
  text: "Target opponent loses 2 life for each Swamp you control. Last Stand deals damage to target creature equal to the number of Mountains you control. Create a 1/1 green Saproling creature token for each Forest you control. You gain 2 life for each Plains you control. Draw a card for each Island you control, then discard that many cards.",
  targets: ["opponent", "creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "lose-life", target: 0, amount: { countOf: { subtype: "Swamp", controlledBy: "you" }, times: 2 } },
      { kind: "damage", target: 1, amount: { countOf: { subtype: "Mountain", controlledBy: "you" } } },
      { kind: "create-token", token: "Saproling Token", count: { countOf: { subtype: "Forest", controlledBy: "you" } } },
      { kind: "gain-life", amount: { countOf: { subtype: "Plains", controlledBy: "you" }, times: 2 } },
      { kind: "draw", amount: { countOf: { subtype: "Island", controlledBy: "you" } } },
      { kind: "discard", target: "you", amount: { countOf: { subtype: "Island", controlledBy: "you" } } },
    ],
  },
});
