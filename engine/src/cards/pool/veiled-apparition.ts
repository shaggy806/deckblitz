import { defineCard } from "../define.js";

const UPKEEP = "At the beginning of your upkeep, sacrifice this creature unless you pay {1}{U}.";
const TEXT = `When an opponent casts a spell, if this permanent is an enchantment, it becomes a 3/3 Illusion creature with flying and "${UPKEEP}"`;

export default defineCard({
  name: "Veiled Apparition",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent" },
      condition: { kind: "source", filter: { type: "enchantment" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "animate",
            target: "source",
            power: 3,
            toughness: 3,
            setTypes: ["creature"],
            addTypes: [],
            addSubtypes: [],
            setSubtypes: ["Illusion"],
            keywords: ["flying"],
            duration: "permanent",
          },
          {
            kind: "grant-triggered",
            target: "source",
            ability: {
              trigger: { on: "step-begins", step: "upkeep", who: "you" },
              targets: [],
              effect: {
                kind: "unless",
                chooser: "you",
                options: [{ pay: "{1}{U}", text: "Pay {1}{U}" }],
                otherwise: { kind: "sacrifice-source" },
              },
              resolve: null,
              text: UPKEEP,
            },
            duration: "permanent",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
