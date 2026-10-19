import { defineCard } from "../define.js";

// EDHREC rank 17651.

export default defineCard({
  name: "Tyranid Invasion",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Create a number of 3/3 green Tyranid Warrior creature tokens with trample equal to the number of opponents you have.",
  targets: [],
  effect: { kind: "create-token", token: "Tyranid Warrior Token", count: { countPlayers: "each-opponent" } },
});
