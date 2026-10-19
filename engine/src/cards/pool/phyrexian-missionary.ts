import { defineCard } from "../define.js";

// Dominaria United (DMU). EDHREC rank 18440. Nullpriest of Oblivion's
// kicked enters trigger, returning to the hand instead.
const KICKED_TEXT =
  "When this creature enters, if it was kicked, return target creature card from your graveyard to your hand.";

export default defineCard({
  name: "Phyrexian Missionary",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Human", "Cleric"],
  power: 2,
  toughness: 3,
  keywords: ["lifelink"],
  text: `Kicker {1}{B} (You may pay an additional {1}{B} as you cast this spell.)\nLifelink\n${KICKED_TEXT}`,
  kicker: { cost: "{1}{B}" },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "self-kicked" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: KICKED_TEXT,
    },
  ],
});
