import { defineCard } from "../define.js";

export default defineCard({
  name: "Coursers' Accord",
  manaCost: "{4}{G}{W}",
  colors: ["W", "G"],
  types: ["sorcery"],
  text: "Create a 3/3 green Centaur creature token, then populate. (Create a token that's a copy of a creature token you control.)",
  effect: {
    kind: "sequence",
    effects: [{ kind: "create-token", token: "3/3 Centaur Token", count: 1 }, { kind: "populate" }],
  },
});
