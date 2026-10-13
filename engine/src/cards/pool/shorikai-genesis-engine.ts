import { defineCard } from "../define.js";
import { crew, crewText } from "../helpers.js";

// EDHREC rank 2305. A legendary Vehicle, so it can be your commander (rule
// 903.3).
const LOOT_TEXT =
  '{1}, {T}: Draw two cards, then discard a card. Create a 1/1 colorless Pilot creature token with "This token crews Vehicles as though its power were 2 greater."';

export default defineCard({
  name: "Shorikai, Genesis Engine",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 8,
  toughness: 8,
  text: `${LOOT_TEXT}\n${crewText(8)}`,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2 },
          { kind: "discard", target: "you", amount: 1 },
          { kind: "create-token", token: "Pilot Token (Crews Vehicles)", count: 1 },
        ],
      },
      resolve: null,
      text: LOOT_TEXT,
    },
    crew(8),
  ],
});
