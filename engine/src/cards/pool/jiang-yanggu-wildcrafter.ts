import { defineCard } from "../define.js";
import { addManaAbility } from "../helpers.js";

const GRANT_TEXT = 'Each creature you control with a +1/+1 counter on it has "{T}: Add one mana of any color."';

export default defineCard({
  name: "Jiang Yanggu, Wildcrafter",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["planeswalker"],
  subtypes: ["Yanggu"],
  supertypes: ["legendary"],
  loyalty: 3,
  text: `${GRANT_TEXT}\n−1: Put a +1/+1 counter on target creature.`,
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
      },
      grantsActivated: [addManaAbility({ mana: "any-color", text: "{T}: Add one mana of any color." })],
      text: GRANT_TEXT,
    },
  ],
  activated: [
    {
      loyaltyCost: -1,
      cost: { mana: null, tap: false },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "−1: Put a +1/+1 counter on target creature.",
    },
  ],
});
