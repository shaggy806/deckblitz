import { defineCard } from "../define.js";

export default defineCard({
  name: "Dodecapod",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 3,
  toughness: 3,
  text: "If a spell or ability an opponent controls causes you to discard this card, put it onto the battlefield with two +1/+1 counters on it instead of putting it into your graveyard.",
  discardedByOpponentEnters: { withCounters: { kind: "+1/+1", amount: 2 } },
});
