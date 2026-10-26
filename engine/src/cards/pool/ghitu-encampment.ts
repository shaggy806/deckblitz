import { defineCard } from "../define.js";

export default defineCard({
  name: "Ghitu Encampment",
  colors: [],
  types: ["land"],
  text: "This land enters tapped.\n{T}: Add {R}.\n{1}{R}: This land becomes a 2/1 red Warrior creature with first strike until end of turn. It's still a land. (It deals combat damage before creatures without first strike.)",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: 1 },
      resolve: null,
      text: "{T}: Add {R}.",
    },
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 2,
        toughness: 1,
        addTypes: ["creature"],
        addSubtypes: ["Warrior"],
        setColors: ["R"],
        keywords: ["first-strike"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{1}{R}: This land becomes a 2/1 red Warrior creature with first strike until end of turn. It's still a land.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
});
