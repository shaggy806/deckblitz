import { defineCard } from "../define.js";

// Rulings:
//   A noncreature permanent that turns into a creature can attack, and its {T} abilities can be
//     activated, only if its controller has continuously controlled that permanent since the
//     beginning of their most recent turn. It doesn't matter how long the permanent has been a
//     creature.

export default defineCard({
  name: "Quirion Druid",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 1,
  toughness: 2,
  text: "{G}, {T}: Target land becomes a 2/2 green creature that's still a land. (This effect lasts indefinitely.)",
  activated: [
    {
      cost: { mana: "{G}", tap: true },
      targets: ["land"],
      effect: {
        kind: "animate",
        target: 0,
        power: 2,
        toughness: 2,
        addTypes: ["creature"],
        addSubtypes: [],
        setColors: ["G"],
        duration: "permanent",
      },
      resolve: null,
      text: "{G}, {T}: Target land becomes a 2/2 green creature that's still a land.",
    },
  ],
});
