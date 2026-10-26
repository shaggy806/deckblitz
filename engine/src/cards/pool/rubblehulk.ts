import { defineCard } from "../define.js";

// EDHREC rank 13484.
//
// Rulings:
//   [2013-01-24] If you activate Rubblehulk's bloodrush ability, the value of X is the number of
//     lands you control when that ability resolves.
//   [2013-01-24] The ability that defines Rubblehulk's power and toughness works in all zones, not
//     just the battlefield.

const PT_TEXT = "Rubblehulk's power and toughness are each equal to the number of lands you control.";
const BLOODRUSH_TEXT =
  "Bloodrush — {1}{R}{G}, Discard this card: Target attacking creature gets +X/+X until end of turn, where X is the number of lands you control.";

const LANDS = { countOf: { type: "land", controlledBy: "you" } } as const;

export default defineCard({
  name: "Rubblehulk",
  manaCost: "{4}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 0,
  toughness: 0,
  text: `${PT_TEXT}\n${BLOODRUSH_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: LANDS, plusPower: 0, plusToughness: 0 },
      text: PT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{R}{G}", tap: false },
      targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
      effect: { kind: "modify-pt", target: 0, power: LANDS, toughness: LANDS, duration: "end-of-turn" },
      resolve: null,
      text: BLOODRUSH_TEXT,
      zone: "hand",
    },
  ],
});
