import { defineCard } from "../define.js";

export default defineCard({
  name: "Shamble Back",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Exile target creature card from a graveyard. Create a 2/2 black Zombie creature token. You gain 2 life.",
  targets: [{ kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      { kind: "create-token", token: "Zombie Token", count: 1 },
      { kind: "gain-life", amount: 2 },
    ],
  },
});
