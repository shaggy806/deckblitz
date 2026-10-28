import { defineCard } from "../define.js";

// EDHREC rank 28873.
//
// "Becomes a Dragon" replaces its creature types (`add-types`' setSubtypes) and
// nothing else.
//
// Rulings:
//   [2009-02-01] When Dragonsoul Knight's activated ability resolves, Dragonsoul Knight will gain
//     flying and trample in addition to its other abilities. However, becoming a Dragon will make
//     it lose all other creature types. It will no longer be a Human or a Knight.
//   [2009-02-01] You can activate Dragonsoul Knight's ability more than once during a turn. The
//     second time it resolves, it will probably have no visible effect other than giving
//     Dragonsoul Knight another +5/+3.

export default defineCard({
  name: "Dragonsoul Knight",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike"],
  text: "First strike\n{W}{U}{B}{R}{G}: Until end of turn, this creature becomes a Dragon, gets +5/+3, and gains flying and trample.",
  activated: [
    {
      cost: { mana: "{W}{U}{B}{R}{G}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-types", target: "source", setSubtypes: ["Dragon"], duration: "end-of-turn" },
          { kind: "modify-pt", target: "source", power: 5, toughness: 3, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "trample", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "{W}{U}{B}{R}{G}: Until end of turn, this creature becomes a Dragon, gets +5/+3, and gains flying and trample.",
    },
  ],
});
