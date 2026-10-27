import { defineCard } from "../define.js";

// Rulings:
//   [2008-08-01] A noncreature permanent that turns into a creature can attack, and its {T}
//     abilities can be activated, only if its controller has continuously controlled that
//     permanent since the beginning of their most recent turn.

export default defineCard({
  name: "Ambush Commander",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf"],
  power: 2,
  toughness: 2,
  text: "Forests you control are 1/1 green Elf creatures that are still lands.\n{1}{G}, Sacrifice an Elf: Target creature gets +3/+3 until end of turn.",
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Forest", controlledBy: "you" } },
      addTypes: ["creature"],
      addSubtypes: ["Elf"],
      setColors: ["G"],
      setBasePt: { power: 1, toughness: 1 },
      text: "Forests you control are 1/1 green Elf creatures that are still lands.",
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false, sacrifice: { filter: { subtype: "Elf" } } },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
      resolve: null,
      text: "{1}{G}, Sacrifice an Elf: Target creature gets +3/+3 until end of turn.",
    },
  ],
});
