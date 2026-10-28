import { defineCard } from "../define.js";

// EDHREC rank 5842.
//
// The group's bound is read as the ability is activated, before its costs
// are paid (the ruling: what happens to Bobbleheads afterwards doesn't matter).

const MANA_TEXT = "{T}: Add one mana of any color.";
const PUMP_TEXT =
  "{3}, {T}: Up to X target creatures you control get +1/+0 and gain indestructible until end of turn, where X is the number of Bobbleheads you control as you activate this ability. Activate only as a sorcery.";

export default defineCard({
  name: "Endurance Bobblehead",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Bobblehead"],
  text: `${MANA_TEXT}\n${PUMP_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: MANA_TEXT,
    },
    {
      cost: { mana: "{3}", tap: true },
      targets: [
        {
          kind: "any-number",
          of: "creature-you-control",
          max: { countOf: { subtype: "Bobblehead", controlledBy: "you" } },
        },
      ],
      effect: {
        kind: "for-each-target",
        from: 0,
        effect: {
          kind: "sequence",
          effects: [
            { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
            { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
          ],
        },
      },
      resolve: null,
      text: PUMP_TEXT,
      sorcerySpeed: true,
    },
  ],
});
