import { defineCard } from "../define.js";

export default defineCard({
  name: "Winter, Team Player",
  manaCost: "{4}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 3,
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nWhenever you cast a noncreature spell, creatures you control get +1/+0 until end of turn.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Whenever you cast a noncreature spell, creatures you control get +1/+0 until end of turn.",
    },
  ],
});
