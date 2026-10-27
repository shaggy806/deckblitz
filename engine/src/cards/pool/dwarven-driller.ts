import { defineCard } from "../define.js";

const TEXT = "{T}: Destroy target land unless its controller has this creature deal 2 damage to them.";

export default defineCard({
  name: "Dwarven Driller",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dwarf"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["land"],
      effect: {
        kind: "each-player-may",
        who: { controllerOfTarget: 0 },
        choices: [
          {
            text: "Have Dwarven Driller deal 2 damage to you.",
            effect: { kind: "damage", amount: 2, who: "that-player" },
          },
          { text: "Let the land be destroyed.", effect: { kind: "destroy", target: 0 } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
