import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

// EDHREC rank 21996. "If you cast it" is an intervening if (Annie Flash's
// condition); the two cards come back together (`simultaneous`, Lord
// Windgrace's shape).

const ENTER_TEXT =
  "When this creature enters, if you cast it, return up to two target creature cards with mana value 2 or less " +
  "from your graveyard to the battlefield.";

const SMALL_CREATURE: TargetSpec = {
  kind: "card-in-graveyard",
  whose: "you",
  filter: { type: "creature", manaValue: { op: "lte", n: 2 } },
};

export default defineCard({
  name: "Sigardian Savior",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { cast: true, castBy: "you" } },
      targets: [
        { kind: "optional", of: SMALL_CREATURE },
        { kind: "optional", of: { kind: "other", of: SMALL_CREATURE, than: { slots: [0] } } },
      ],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "put-onto-battlefield", target: 0 },
          { kind: "put-onto-battlefield", target: 1 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
