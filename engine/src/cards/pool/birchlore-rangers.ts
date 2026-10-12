import { defineCard } from "../define.js";

export default defineCard({
  name: "Birchlore Rangers",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Druid", "Ranger"],
  power: 1,
  toughness: 1,
  morph: { keyword: "morph", cost: "{G}" },
  text: "Tap two untapped Elves you control: Add one mana of any color.\nMorph {G} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 2, filter: { subtype: "Elf", controlledBy: "you" }, includeSelf: true },
      },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "Tap two untapped Elves you control: Add one mana of any color.",
    },
  ],
});
