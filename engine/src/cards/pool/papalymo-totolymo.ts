import { defineCard } from "../define.js";

const TRIGGER_TEXT = "Whenever you cast a noncreature spell, Papalymo Totolymo deals 1 damage to each opponent and you gain 1 life.";
const SAC_TEXT = "{4}, {T}, Sacrifice Papalymo Totolymo: Each opponent who lost life this turn sacrifices a creature with the greatest power among creatures they control.";

export default defineCard({
  name: "Papalymo Totolymo",
  manaCost: "{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Dwarf", "Wizard"],
  supertypes: ["legendary"],
  power: 1,
  toughness: 2,
  text: `${TRIGGER_TEXT}\n${SAC_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 1, who: "each-opponent" },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{4}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "each-opponent",
        whoIf: { kind: "of-player", player: "that-player", condition: { kind: "turn-stat", stat: "life-lost", who: "you", atLeast: 1 } },
        simultaneous: true,
        effect: {
          kind: "sacrifice",
          who: "that-player",
          filter: { type: "creature", greatestAmongItsController: { of: "power", among: { type: "creature" } } },
          count: 1,
        },
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
