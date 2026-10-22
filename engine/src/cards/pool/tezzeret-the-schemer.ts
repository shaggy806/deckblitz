import { defineCard } from "../define.js";

// Aether Revolt. The −2's X is the artifacts you control as it resolves (its
// ruling), -X as Chatterfang's `product` with -1. The emblem's animation lasts
// indefinitely and sets base P/T 5/5 (layer 7b), over a Vehicle's or an
// artifact creature's own (its rulings) — Iron Man, Futurist Paragon's shape.
const PLUS_TEXT =
  '+1: Create a colorless artifact token named Etherium Cell with "{T}, Sacrifice this token: Add one mana of any color."';
const MINUS_TEXT = "−2: Target creature gets +X/-X until end of turn, where X is the number of artifacts you control.";
const EMBLEM_TRIGGER_TEXT =
  "At the beginning of combat on your turn, target artifact you control becomes an artifact creature with base power and toughness 5/5.";
const ULT_TEXT = `−7: You get an emblem with "${EMBLEM_TRIGGER_TEXT}"`;

const ARTIFACTS = { countOf: { type: "artifact", controlledBy: "you" } } as const;

export default defineCard({
  name: "Tezzeret the Schemer",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Tezzeret"],
  loyalty: 5,
  text: `${PLUS_TEXT}\n${MINUS_TEXT}\n${ULT_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Etherium Cell Token", count: 1 },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: ["creature"],
      effect: {
        kind: "modify-pt",
        target: 0,
        power: ARTIFACTS,
        toughness: { product: [ARTIFACTS, -1] },
        duration: "end-of-turn",
      },
      resolve: null,
      text: MINUS_TEXT,
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: EMBLEM_TRIGGER_TEXT,
        triggered: [
          {
            trigger: { on: "step-begins", step: "begin-combat", who: "you" },
            targets: [{ kind: "permanent", filter: { type: "artifact", controlledBy: "you" } }],
            effect: {
              kind: "animate",
              target: 0,
              power: 5,
              toughness: 5,
              addTypes: ["artifact", "creature"],
              addSubtypes: [],
              duration: "permanent",
            },
            resolve: null,
            text: EMBLEM_TRIGGER_TEXT,
          },
        ],
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});
