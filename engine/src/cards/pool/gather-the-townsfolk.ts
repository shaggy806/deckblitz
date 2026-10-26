import { defineCard } from "../define.js";

// EDHREC rank 11890.
export default defineCard({
  name: "Gather the Townsfolk",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Create two 1/1 white Human creature tokens.\nFateful hour — If you have 5 or less life, create five of those tokens instead.",
  targets: [],
  effect: {
    kind: "create-token",
    token: "Human Token",
    count: { ifCondition: { kind: "life-total", who: "you", atMost: 5 }, then: 5, else: 2 },
  },
});
