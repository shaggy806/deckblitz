import { defineCard } from "../define.js";
import { PARLEY_NONLAND, parley } from "../helpers.js";

// Conspiracy (CNS). EDHREC rank 20645.
export default defineCard({
  name: "Rousing of Souls",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Parley — Each player reveals the top card of their library. For each nonland card revealed this way, you create a 1/1 white Spirit creature token with flying. Then each player draws a card.",
  effect: parley({ kind: "create-token", token: "Spirit Token", count: PARLEY_NONLAND }),
});
