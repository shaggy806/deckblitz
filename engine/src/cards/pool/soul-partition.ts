import { defineCard } from "../define.js";

export default defineCard({
  name: "Soul Partition",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Exile target nonland permanent. For as long as that card remains exiled, its owner may play it. A spell cast by an opponent this way costs {2} more to cast.",
  targets: ["nonland-permanent"],
  effect: {
    kind: "exile",
    target: 0,
    mayPlay: { duration: "while-exiled", play: true, byOwner: true, tax: { generic: 2, opponentsOnly: true } },
  },
});
