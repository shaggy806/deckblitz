import { defineCard } from "../define.js";

// One slot over an ability and a spell with a filter of its own (`one-of`).
export default defineCard({
  name: "Tale's End",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target activated ability, triggered ability, or legendary spell.",
  targets: [
    {
      kind: "one-of",
      of: [{ kind: "ability" }, { kind: "spell", filter: { supertype: "legendary" } }],
    },
  ],
  effect: { kind: "counter", target: 0 },
});
