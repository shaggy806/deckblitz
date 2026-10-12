import { defineCard } from "../define.js";

export default defineCard({
  name: "Root-Kin Ally",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental", "Warrior"],
  power: 3,
  toughness: 3,
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nTap two untapped creatures you control: This creature gets +2/+2 until end of turn.",
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 2, filter: { type: "creature", controlledBy: "you" }, includeSelf: true },
      },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: "Tap two untapped creatures you control: This creature gets +2/+2 until end of turn.",
    },
  ],
});
