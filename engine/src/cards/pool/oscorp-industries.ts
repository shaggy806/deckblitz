import { defineCard } from "../define.js";

const PAIN_TEXT = "When this land enters from a graveyard, you lose 2 life.";

// Cost-less mayhem (rule 702.187c): played from your graveyard the turn you
// discarded it — a land play.
export default defineCard({
  name: "Oscorp Industries",
  colors: [],
  types: ["land"],
  mayhem: {},
  text:
    `This land enters tapped.\n${PAIN_TEXT}\n{T}: Add {U}, {B}, or {R}.\n` +
    "Mayhem (You may play this card from your graveyard if you discarded it this turn. Timing rules still apply.)",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self", filter: { enteredFrom: "graveyard" } },
      targets: [],
      effect: { kind: "lose-life", amount: 2 },
      resolve: null,
      text: PAIN_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["U", "B", "R"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {U}, {B}, or {R}.",
    },
  ],
});
