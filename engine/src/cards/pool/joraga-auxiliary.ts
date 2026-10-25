import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

const TEXT = "{4}{G}{W}: Support 2. (Put a +1/+1 counter on each of up to two other target creatures.)";

export default defineCard({
  name: "Joraga Auxiliary",
  manaCost: "{1}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Elf", "Soldier", "Ally"],
  power: 2,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{4}{G}{W}", tap: false },
      // Support on a permanent (rule 701.41a): "other" target creatures.
      targets: distinctTargets(2, { kind: "other", of: "creature" }, { optional: true }),
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
