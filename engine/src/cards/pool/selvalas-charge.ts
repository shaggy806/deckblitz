import { defineCard } from "../define.js";
import { PARLEY_NONLAND, parley } from "../helpers.js";

// Conspiracy (CNS). EDHREC rank 23414.
export default defineCard({
  name: "Selvala's Charge",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Parley — Each player reveals the top card of their library. For each nonland card revealed this way, you create a 3/3 green Elephant creature token. Then each player draws a card.",
  effect: parley({ kind: "create-token", token: "Elephant Token", count: PARLEY_NONLAND }),
});
