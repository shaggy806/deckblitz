import { defineCard } from "../define.js";

// EDHREC rank 29155.

export default defineCard({
  name: "Leap of Faith",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature gains flying until end of turn. Prevent all damage that would be dealt to that creature this turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      { kind: "prevent-damage", target: 0, amount: "all" },
    ],
  },
});
