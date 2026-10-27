import { defineCard } from "../define.js";

// "Deals 1 damage to target creature unless that creature's controller has
// this creature deal 2 damage to them": the target's controller picks one of
// the two outcomes as the ability resolves (Combustion Man's `choices` shape).
// The creature was sacrificed to pay the cost, so either damage is dealt by it
// as it last existed (rule 608.2h).
const TEXT =
  "Sacrifice this creature: This creature deals 1 damage to target creature unless that creature's controller has this creature deal 2 damage to them.";

export default defineCard({
  name: "Dwarven Scorcher",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dwarf"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: ["creature"],
      effect: {
        kind: "each-player-may",
        who: { controllerOfTarget: 0 },
        choices: [
          {
            text: "Have Dwarven Scorcher deal 2 damage to you.",
            effect: { kind: "damage", amount: 2, who: "that-player" },
          },
          { text: "Let Dwarven Scorcher deal 1 damage to the creature.", effect: { kind: "damage", amount: 1, target: 0 } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
