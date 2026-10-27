import { defineCard } from "../define.js";

// Judgment (JUD). EDHREC rank 27689.
//
// Pharika's shape: the token goes to the exiled card's owner
// (`who: "target-controller"`, which for a card in a graveyard is its owner).

export default defineCard({
  name: "Funeral Pyre",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Exile target card from a graveyard. Its owner creates a 1/1 white Spirit creature token with flying.",
  targets: [{ kind: "card-in-graveyard", whose: "any" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      { kind: "create-token", token: "Spirit Token", count: 1, who: "target-controller" },
    ],
  },
});
