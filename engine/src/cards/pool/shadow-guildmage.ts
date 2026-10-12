import { defineCard } from "../define.js";

export default defineCard({
  name: "Shadow Guildmage",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: "{U}, {T}: Put target creature you control on top of its owner's library.\n{R}, {T}: This creature deals 1 damage to any target and 1 damage to you.",
  activated: [
    {
      cost: { mana: "{U}", tap: true },
      targets: ["creature-you-control"],
      effect: { kind: "put-on-library", target: 0, position: "top" },
      resolve: null,
      text: "{U}, {T}: Put target creature you control on top of its owner's library.",
    },
    {
      cost: { mana: "{R}", tap: true },
      targets: ["any-target"],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [{ kind: "damage", amount: 1, target: 0 }, { kind: "damage", amount: 1, who: "you" }],
      },
      resolve: null,
      text: "{R}, {T}: This creature deals 1 damage to any target and 1 damage to you.",
    },
  ],
});
