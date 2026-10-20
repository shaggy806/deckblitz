import { defineCard } from "../define.js";

// Rule 610.3: the exile is a one-shot effect, and so is the return the engine
// makes right after Banishing Light leaves (`untilSourceLeaves`).
export default defineCard({
  name: "Banishing Light",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text:
    "When Banishing Light enters, exile target nonland permanent an opponent " +
    "controls until Banishing Light leaves the battlefield.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["nonland-permanent-an-opponent-controls"],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text:
        "When Banishing Light enters, exile target nonland permanent an opponent " +
        "controls until Banishing Light leaves the battlefield.",
    },
  ],
});
