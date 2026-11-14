import { defineCard } from "../define.js";

// EDHREC rank 16851.
export default defineCard({
  name: "The Art of Tea",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  subtypes: ["Lesson"],
  text: "Put a +1/+1 counter on up to one target creature you control. Create a Food token. (It's an artifact with \"{2}, {T}, Sacrifice this token: You gain 3 life.\")",
  targets: [{ kind: "optional", of: "creature-you-control" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      { kind: "create-token", token: "Food Token", count: 1 },
    ],
  },
});
