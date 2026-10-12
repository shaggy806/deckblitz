import { defineCard } from "../define.js";

const CONNIVE_TEXT = "Mental Organism — Pay 3 life: M.O.D.O.K. connives. Activate only during your turn.";
const SHRINK_TEXT = "Designed Only for Killing — Creatures your opponents control get -1/-1.";

export default defineCard({
  name: "M.O.D.O.K.",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Villain"],
  power: 2,
  toughness: 2,
  keywords: ["flying", "lifelink"],
  text:
    `Flying, lifelink\n${CONNIVE_TEXT} (Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on this creature.)\n` +
    SHRINK_TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, payLife: 3 },
      condition: { kind: "your-turn" },
      targets: [],
      // Connives even if he has left by then, as he last existed (701.50b).
      effect: { kind: "connive", target: "source" },
      resolve: null,
      text: CONNIVE_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "opponent" } },
      grantPt: [-1, -1],
      text: SHRINK_TEXT,
    },
  ],
});
