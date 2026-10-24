import { defineCard } from "../define.js";

// EDHREC rank 8963.
//
// The +1 is Gideon, Martial Paragon's 0 with Ally among the creature types
// (the ruling: Human, Soldier and Ally are creature types; he stays a
// Gideon planeswalker). Becoming a creature isn't entering, so rally doesn't
// trigger off it.

const PLUS =
  "+1: Until end of turn, Gideon becomes a 5/5 Human Soldier Ally creature with indestructible that's still a planeswalker. Prevent all damage that would be dealt to him this turn.";
const ZERO = "0: Create a 2/2 white Knight Ally creature token.";
const ULT = '−4: You get an emblem with "Creatures you control get +1/+1."';
const EMBLEM_TEXT = "Creatures you control get +1/+1.";

export default defineCard({
  name: "Gideon, Ally of Zendikar",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Gideon"],
  loyalty: 4,
  text: `${PLUS}\n${ZERO}\n${ULT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "animate",
            target: "source",
            power: 5,
            toughness: 5,
            addTypes: ["creature"],
            addSubtypes: ["Human", "Soldier", "Ally"],
            keywords: ["indestructible"],
            duration: "end-of-turn",
          },
          { kind: "prevent-damage", target: "source", amount: "all" },
        ],
      },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: 0,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Knight Ally Token", count: 1 },
      resolve: null,
      text: ZERO,
    },
    {
      loyaltyCost: -4,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: EMBLEM_TEXT,
        static: { affects: { scope: "creatures-you-control" }, grantPt: [1, 1], text: EMBLEM_TEXT },
      },
      resolve: null,
      text: ULT,
    },
  ],
});
