import { defineCard } from "../define.js";

// EDHREC rank 16609.

export default defineCard({
  name: "Reduce to Memory",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  subtypes: ["Lesson"],
  text: "Exile target nonland permanent. Its controller creates a 3/2 red and white Spirit creature token.",
  targets: ["nonland-permanent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      { kind: "create-token", token: "Spirit Token (Red-White)", count: 1, who: "target-controller" },
    ],
  },
});
