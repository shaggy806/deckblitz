import { defineCard } from "../define.js";

const TEXT = "{3}, {T}: Up to X target creatures you control each gain haste until end of turn and can't be blocked this turn except by creatures with haste, where X is the number of Bobbleheads you control as you activate this ability.";

export default defineCard({
  name: "Agility Bobblehead",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Bobblehead"],
  text: `{T}: Add one mana of any color.\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color.",
    },
    {
      cost: { mana: "{3}", tap: true },
      targets: [{ kind: "any-number", of: "creature-you-control", max: { countOf: { subtype: "Bobblehead", controlledBy: "you" } } }],
      effect: {
        kind: "for-each-target",
        from: 0,
        effect: {
          kind: "sequence",
          effects: [
            { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
            { kind: "restrict", target: 0, restrictions: [{ kind: "cant-be-blocked", by: { notKeyword: "haste" } }] },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
