import { defineCard } from "../define.js";

const PLUS = "+2: Untap all creatures you control. Those creatures get +1/+1 until end of turn.";
const ZERO =
  "0: Until end of turn, Gideon becomes a 5/5 Human Soldier creature with indestructible that's still a planeswalker. Prevent all damage that would be dealt to him this turn.";
const ULT = "−10: Creatures you control get +2/+2 until end of turn. Tap all creatures your opponents control.";

export default defineCard({
  name: "Gideon, Martial Paragon",
  manaCost: "{4}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Gideon"],
  loyalty: 5,
  text: `${PLUS}\n${ZERO}\n${ULT}`,
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [],
      // The ruling: every creature you control gets +1/+1, not only the ones
      // it untapped — the set fixed as the ability resolves.
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap-all", filter: { type: "creature", controlledBy: "you" } },
          {
            kind: "modify-pt-all",
            filter: { type: "creature", controlledBy: "you" },
            power: 1,
            toughness: 1,
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: 0,
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
            addSubtypes: ["Human", "Soldier"],
            keywords: ["indestructible"],
            duration: "end-of-turn",
          },
          { kind: "prevent-damage", target: "source", amount: "all" },
        ],
      },
      resolve: null,
      text: ZERO,
    },
    {
      loyaltyCost: -10,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt-all",
            filter: { type: "creature", controlledBy: "you" },
            power: 2,
            toughness: 2,
            duration: "end-of-turn",
          },
          { kind: "tap-all", filter: { type: "creature", controlledBy: "opponent" } },
        ],
      },
      resolve: null,
      text: ULT,
    },
  ],
});
