import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 17790.
//
// Pongify's shape: the token goes to the destroyed creature's controller, read
// as it last existed (rule 608.2h).

export default defineCard({
  name: "Afterlife",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Destroy target creature. It can't be regenerated. Its controller creates a 1/1 white Spirit creature token with flying.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0, cantBeRegenerated: true },
      { kind: "create-token", token: "Spirit Token", count: 1, who: "target-controller" },
    ],
  },
});
