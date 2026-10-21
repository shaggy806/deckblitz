import { defineCard } from "../define.js";

// EDHREC rank 20043.

export default defineCard({
  name: "Wolf's Quarry",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: 'Create three 1/1 green Boar creature tokens with "When this token dies, create a Food token." (A Food token is an artifact with "{2}, {T}, Sacrifice this token: You gain 3 life.")',
  effect: { kind: "create-token", token: "Boar Token (Wolf's Quarry)", count: 3 },
});
