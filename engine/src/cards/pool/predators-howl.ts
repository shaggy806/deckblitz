import { defineCard } from "../define.js";

// Magic 2015 (M15). EDHREC rank 17540.

export default defineCard({
  name: "Predator's Howl",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Create a 2/2 green Wolf creature token.\nMorbid — Create three 2/2 green Wolf creature tokens instead if a creature died this turn.",
  targets: [],
  effect: {
    kind: "conditional",
    condition: { kind: "creature-died-this-turn" },
    then: { kind: "create-token", token: "Wolf Token", count: 3 },
    else: { kind: "create-token", token: "Wolf Token", count: 1 },
  },
});
