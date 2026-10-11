import { defineCard } from "../define.js";

// Reality Fracture (FRA). EDHREC rank 19960.

const ETB_TEXT = "When The Echoverse Fulcrum enters, draw a card, then discard a card.";
const WRATH_TEXT = "{5}, {T}, Exile The Echoverse Fulcrum: Destroy all creatures. Activate only as a sorcery.";

export default defineCard({
  name: "The Echoverse Fulcrum",
  manaCost: "{2}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: `${ETB_TEXT}\n${WRATH_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{5}", tap: true, exileSelf: true },
      targets: [],
      effect: { kind: "destroy-all", filter: { type: "creature" } },
      resolve: null,
      text: WRATH_TEXT,
      sorcerySpeed: true,
    },
  ],
});
