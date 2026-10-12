import { defineCard } from "../define.js";

export default defineCard({
  name: "Shadowfeed",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Exile target card from a graveyard. You gain 3 life.",
  targets: [{ kind: "card-in-graveyard", whose: "any" }],
  effect: {
    kind: "sequence",
    effects: [{ kind: "exile", target: 0 }, { kind: "gain-life", amount: 3 }],
  },
});
