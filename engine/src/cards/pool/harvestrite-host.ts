import { defineCard } from "../define.js";

// EDHREC rank 11093.
//
// Rulings:
//   [2024-07-26] If the target creature is an illegal target as Harvestrite Host’s ability tries
//     to resolve, it won’t resolve and none of its effects will happen. It won’t count toward the
//     number of times the ability has resolved this turn.
//
// "This creature or another Rabbit you control" is one ability — its
// "second time this ability has resolved this turn" counts both kinds of
// entry together — so it's a single `you-control` Rabbit trigger, the Host
// (a Rabbit) included (Possibility Technician's shape), rather than two
// abilities each counting its own resolutions. A fizzled resolution isn't
// counted (`resolved-this-turn`, as the ruling says).

const TEXT =
  "Whenever this creature or another Rabbit you control enters, target creature you control gets +1/+0 until end of turn. Then draw a card if this is the second time this ability has resolved this turn.";

export default defineCard({
  name: "Harvestrite Host",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Rabbit", "Citizen"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Rabbit" } },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
          {
            kind: "conditional",
            condition: { kind: "resolved-this-turn", n: 2 },
            then: { kind: "draw", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
