import { defineCard } from "../define.js";

// EDHREC rank 29519.
// "Strange new worlds" is an ability word (rule 207.2c): no rules of its own.

export default defineCard({
  name: "Deep Space Scan",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Strange new worlds — Draw X cards, where X is the number of differently named lands you control. You have no maximum hand size until your next turn.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: { aggregate: "distinct", of: "name", filter: { type: "land", controlledBy: "you" } } },
      { kind: "player-effect", duration: "until-your-next-turn", noMaxHandSize: "you" },
    ],
  },
});
