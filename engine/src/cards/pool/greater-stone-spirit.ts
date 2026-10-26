import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 30806.
//
// Rulings:
//   [2006-07-15] After Greater Stone Spirit's activated ability is activated, the affected
//     creature gains an activated ability that only that creature's controller can activate.
//   [2007-05-01] Creatures with the Reach ability (such as Giant Spider) can block this because
//     they don't actually have Flying.

const GRANTED = "{R}: This creature gets +1/+0 until end of turn.";

export default defineCard({
  name: "Greater Stone Spirit",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Spirit"],
  power: 4,
  toughness: 4,
  text: `This creature can't be blocked by creatures with flying.\n{2}{R}: Until end of turn, target creature gets +0/+2 and gains "${GRANTED}"`,
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { keyword: "flying" },
      text: "This creature can't be blocked by creatures with flying.",
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 0, toughness: 2, duration: "end-of-turn" },
          {
            kind: "grant-activated",
            target: 0,
            ability: {
              cost: { mana: "{R}", tap: false },
              targets: [],
              effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
              resolve: null,
              text: GRANTED,
            },
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: `{2}{R}: Until end of turn, target creature gets +0/+2 and gains "${GRANTED}"`,
    },
  ],
});
