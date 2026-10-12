import { defineCard } from "../define.js";

export default defineCard({
  name: "Crashing Footfalls",
  colors: ["G"],
  types: ["sorcery"],
  suspend: { n: 4, cost: "{G}" },
  text: "Suspend 4—{G} (Rather than cast this card from your hand, pay {G} and exile it with four time counters on it. At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost.)\nCreate two 4/4 green Rhino creature tokens with trample.",
  effect: { kind: "create-token", token: "Rhino Token", count: 2 },
});
