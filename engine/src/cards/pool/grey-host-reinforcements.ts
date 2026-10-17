import { defineCard } from "../define.js";

// EDHREC rank 12234.

const ETB_TEXT =
  "When this creature enters, exile target player's graveyard. Put a number of +1/+1 counters on this creature equal to the number of creature cards exiled this way.";

export default defineCard({
  name: "Grey Host Reinforcements",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit", "Soldier"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying, ward {3}\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { mana: "{3}" } },
      resolve: null,
      text: "Ward {3}",
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile-graveyard", target: 0 },
          {
            kind: "add-counter",
            target: "source",
            counter: "+1/+1",
            amount: { thisWay: "exiled", filter: { type: "creature" } },
          },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
