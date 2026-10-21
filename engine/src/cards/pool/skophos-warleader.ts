import { defineCard } from "../define.js";

export default defineCard({
  name: "Skophos Warleader",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Warrior"],
  power: 4,
  toughness: 5,
  text: "{R}, Sacrifice another creature or an enchantment: This creature gets +1/+0 and gains menace until end of turn. (It can't be blocked except by two or more creatures.)",
  activated: [
    {
      cost: { mana: "{R}", tap: false, sacrifice: { filter: { typesAnyOf: ["creature", "enchantment"] } } },
      otherOnly: true,
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "menace", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "{R}, Sacrifice another creature or an enchantment: This creature gets +1/+0 and gains menace until end of turn.",
    },
  ],
});
