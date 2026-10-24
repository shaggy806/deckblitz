import { defineCard } from "../define.js";

// Rulings:
//   [2015-11-04] Once a creature has been legally blocked, activating Kaseto's ability targeting
//     that creature won't cause it to become unblocked. It will give it +2/+2 if it's a Snake,
//     though.

const TEXT =
  "{G}{U}: Target creature can't be blocked this turn. If that creature is a Snake, it gets +2/+2 until end of turn.";

export default defineCard({
  name: "Kaseto, Orochi Archmage",
  manaCost: "{1}{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Snake", "Wizard"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{G}{U}", tap: false },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
          {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { subtype: "Snake" } },
            then: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
