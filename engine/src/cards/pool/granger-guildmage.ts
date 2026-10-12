import { defineCard } from "../define.js";

export default defineCard({
  name: "Granger Guildmage",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: "{R}, {T}: This creature deals 1 damage to any target and 1 damage to you.\n{W}, {T}: Target creature gains first strike until end of turn.",
  activated: [
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
    {
      cost: { mana: "{W}", tap: true },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
      resolve: null,
      text: "{W}, {T}: Target creature gains first strike until end of turn.",
    },
  ],
});
