import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// One ability: it explores, then its power — as it last existed if it has
// left — is checked once, exactly 20 (the rulings).

const TEXT =
  "Whenever you gain life, Amalia Benavides Aguirre explores. Then destroy all other creatures if its power is exactly 20.";

export default defineCard({
  name: "Amalia Benavides Aguirre",
  manaCost: "{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire", "Scout"],
  power: 2,
  toughness: 2,
  text: `Ward—Pay 3 life.\n${TEXT} (To have this creature explore, reveal the top card of your library. Put that card into your hand if it's a land. Otherwise, put a +1/+1 counter on this creature, then put the card back or put it into your graveyard.)`,
  triggered: [
    { ...ward({ payLife: 3 }), text: "Ward—Pay 3 life." },
    {
      trigger: { on: "gains-life", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "explore", target: "source" },
          {
            kind: "conditional",
            condition: { kind: "source", filter: { power: { op: "eq", n: 20 } } },
            then: { kind: "destroy-all", filter: { type: "creature" }, exceptSource: true },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
