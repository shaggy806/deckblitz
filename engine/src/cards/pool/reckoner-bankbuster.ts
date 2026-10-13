import { defineCard } from "../define.js";
import { crew } from "../helpers.js";

// EDHREC rank 3795.
//
// "Then if there are no charge counters on this Vehicle" is asked as the
// ability resolves, of the Vehicle as it last existed if it has left (rule
// 608.2h); the counter removed was the cost's.
const ENTERS_TEXT = "This Vehicle enters with three charge counters on it.";
const DRAW_TEXT =
  '{2}, {T}, Remove a charge counter from this Vehicle: Draw a card. Then if there are no charge counters on this Vehicle, create a Treasure token and a 1/1 colorless Pilot creature token with "This token crews Vehicles as though its power were 2 greater."';

export default defineCard({
  name: "Reckoner Bankbuster",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 4,
  toughness: 4,
  text: `${ENTERS_TEXT}\n${DRAW_TEXT}\nCrew 3`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "charge", amount: 3 } },
      text: ENTERS_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: true, removeCounter: { kind: "charge", count: 1 } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "self-counters", counter: "charge", compare: { op: "eq", n: 0 } },
            then: {
              kind: "sequence",
              effects: [
                { kind: "create-token", token: "Treasure Token", count: 1 },
                { kind: "create-token", token: "Pilot Token (Crews Vehicles)", count: 1 },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: DRAW_TEXT,
    },
    crew(3),
  ],
});
