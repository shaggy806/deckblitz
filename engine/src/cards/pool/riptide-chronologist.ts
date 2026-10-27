import { defineCard } from "../define.js";

const TEXT = "{U}, Sacrifice this creature: Untap all creatures of the creature type of your choice.";

// The type is chosen as the ability resolves.
export default defineCard({
  name: "Riptide Chronologist",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{U}", tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "choose-creature-type",
        then: { kind: "untap-all", filter: { type: "creature", subtype: "$chosen" } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
