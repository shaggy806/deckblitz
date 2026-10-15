import { defineCard } from "../define.js";

// EDHREC rank 15644. Beast Within's shape: the destroyed creature's controller
// makes the token, whether or not it was destroyed.

export default defineCard({
  name: "Harsh Annotation",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Destroy target creature. Its controller creates a 1/1 white and black Inkling creature token with flying.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "create-token", token: "Inkling Token (Emeritus of Truce)", count: 1, who: "target-controller" },
    ],
  },
});
