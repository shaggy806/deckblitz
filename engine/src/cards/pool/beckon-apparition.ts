import { defineCard } from "../define.js";

export default defineCard({
  name: "Beckon Apparition",
  manaCost: "{W/B}",
  colors: ["W", "B"],
  types: ["instant"],
  text: "Exile target card from a graveyard. Create a 1/1 white and black Spirit creature token with flying.",
  targets: [{ kind: "card-in-graveyard", whose: "any" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      { kind: "create-token", token: "Spirit Token (White-Black)", count: 1 },
    ],
  },
});
