import { defineCard } from "../define.js";

// EDHREC rank 7608.
//
// It targets, so it isn't a mana ability (the ruling). The count is of this
// ability of this creature resolving this turn — one that fizzled never
// resolved — and only the third time offers the mana (the rulings).
const PUMP_TEXT =
  "{2}: Target creature gains trample until end of turn. If this is the third time this ability has resolved this turn, you may add {R}{R}{R}{R}{R}{R}{R}{R}.";

export default defineCard({
  name: "Soulbright Flamekin",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Shaman"],
  power: 2,
  toughness: 1,
  text: PUMP_TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
          {
            kind: "conditional",
            condition: { kind: "resolved-this-turn", n: 3 },
            then: {
              kind: "may",
              prompt: "Add {R}{R}{R}{R}{R}{R}{R}{R}?",
              effect: { kind: "add-mana", mana: "R", amount: 8 },
            },
          },
        ],
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
