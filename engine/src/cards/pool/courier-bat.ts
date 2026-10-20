import { defineCard } from "../define.js";

// An intervening if (rule 603.4): any life gained this turn counts, even if
// as much or more was lost (the ruling).
const ETB_TEXT =
  "When this creature enters, if you gained life this turn, return up to one target creature card from your graveyard to your hand.";

export default defineCard({
  name: "Courier Bat",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Bat"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "turn-stat", stat: "life-gained", who: "you", atLeast: 1 },
      targets: [
        { kind: "optional", of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } } },
      ],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
