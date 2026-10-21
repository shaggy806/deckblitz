import { defineCard } from "../define.js";

export default defineCard({
  name: "Slaughter-Priest of Mogis",
  manaCost: "{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Shaman"],
  power: 2,
  toughness: 2,
  text: "Whenever you sacrifice a permanent, this creature gets +2/+0 until end of turn.\n{2}, Sacrifice another creature or an enchantment: This creature gains first strike until end of turn.",
  triggered: [
    {
      trigger: { on: "sacrifice", who: "you" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever you sacrifice a permanent, this creature gets +2/+0 until end of turn.",
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false, sacrifice: { filter: { typesAnyOf: ["creature", "enchantment"] } } },
      otherOnly: true,
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "first-strike", duration: "end-of-turn" },
      resolve: null,
      text: "{2}, Sacrifice another creature or an enchantment: This creature gains first strike until end of turn.",
    },
  ],
});
