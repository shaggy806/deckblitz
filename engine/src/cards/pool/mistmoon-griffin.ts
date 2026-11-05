import { defineCard } from "../define.js";

// Graveyard order (rule 404.2): Corpse Dance's `top-of-graveyard`. The top creature card is
// returned even when the Griffin has already left the graveyard (the ruling).

const TEXT =
  "When this creature dies, exile it, then return the top creature card of your graveyard to the battlefield.";

export default defineCard({
  name: "Mistmoon Griffin",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Griffin"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: "trigger-object" },
          {
            kind: "top-of-graveyard",
            filter: { type: "creature" },
            then: { kind: "put-onto-battlefield", target: 0 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
