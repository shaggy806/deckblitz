import { defineCard } from "../define.js";

const TREASURE_TEXT = "{1}{B}, {T}, Pay 1 life: Create a Treasure token.";
const PUMP_TEXT =
  "{2}{B}: Target creature gets +2/+0 until end of turn. If mana from a Treasure was spent to activate this ability, that creature also gains deathtouch until end of turn.";

// EDHREC rank 8900. What paid for this activation (rule 602.2b).
export default defineCard({
  name: "Forsworn Paladin",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 1,
  toughness: 1,
  keywords: ["menace"],
  text: `Menace\n${TREASURE_TEXT}\n${PUMP_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{B}", tap: true, payLife: 1 },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
      resolve: null,
      text: TREASURE_TEXT,
    },
    {
      cost: { mana: "{2}{B}", tap: false },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
          {
            kind: "conditional",
            condition: { kind: "ability-mana-spent", clauses: [{ from: { subtype: "Treasure" } }] },
            then: { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
