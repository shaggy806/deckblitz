import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 16477.
//
// Its power is read as the ability resolves — as it last existed if it has left
// the battlefield (the ruling; `powerOf: "source"`, rule 608.2h).

const TEXT = "{R}, {T}: This creature deals damage equal to its power to any target.";

export default defineCard({
  name: "Spikeshot Goblin",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Shaman"],
  power: 1,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{R}", tap: true },
      targets: ["any-target"],
      effect: { kind: "damage", amount: { powerOf: "source" }, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
