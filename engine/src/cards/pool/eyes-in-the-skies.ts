import { defineCard } from "../define.js";

export default defineCard({
  name: "Eyes in the Skies",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Create a 1/1 white Bird creature token with flying, then populate. (Create a token that's a copy of a creature token you control.)",
  effect: {
    kind: "sequence",
    effects: [{ kind: "create-token", token: "Bird Token", count: 1 }, { kind: "populate" }],
  },
});
