import { defineCard } from "../define.js";

const ANIMATE =
  '{W}: Until end of turn, this enchantment becomes a Monk Avatar creature in addition to its other types and gains "This creature\'s power and toughness are each equal to the number of lore counters on it."';

export default defineCard({
  name: "Myth Realized",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `Whenever you cast a noncreature spell, put a lore counter on this enchantment.\n{2}{W}: Put a lore counter on this enchantment.\n${ANIMATE}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "lore", amount: 1 },
      resolve: null,
      text: "Whenever you cast a noncreature spell, put a lore counter on this enchantment.",
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{W}", tap: false },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "lore", amount: 1 },
      resolve: null,
      text: "{2}{W}: Put a lore counter on this enchantment.",
    },
    {
      cost: { mana: "{W}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "animate", target: "source", addTypes: ["creature"], addSubtypes: ["Monk", "Avatar"], duration: "end-of-turn" },
          {
            kind: "grant-static",
            target: "source",
            ability: {
              affects: { scope: "self" },
              setBasePtFromCount: { countOf: { countersOnThis: "lore" }, plusPower: 0, plusToughness: 0 },
              text: "This creature's power and toughness are each equal to the number of lore counters on it.",
            },
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: ANIMATE,
    },
  ],
});
