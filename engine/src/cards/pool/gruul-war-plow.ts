import { defineCard } from "../define.js";

// EDHREC rank 15045.
//
// Rulings:
//   [2006-02-01] While it's a creature, Gruul War Plow has creature type Juggernaut. It doesn't
//     have any abilities associated with the card named Juggernaut.
//   [2006-02-01] While it's a creature, Gruul War Plow gives itself trample.
//   [2008-08-01] A noncreature permanent that turns into a creature can attack, and its {T}
//     abilities can be activated, only if its controller has continuously controlled that
//     permanent since the beginning of their most recent turn. It doesn't matter how long the
//     permanent has been a creature.
const TRAMPLE_TEXT = "Creatures you control have trample.";
const ANIMATE_TEXT = "{1}{R}{G}: This artifact becomes a 4/4 Juggernaut artifact creature until end of turn.";

export default defineCard({
  name: "Gruul War Plow",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: `${TRAMPLE_TEXT}\n${ANIMATE_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{R}{G}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 4,
        toughness: 4,
        addTypes: ["artifact", "creature"],
        addSubtypes: ["Juggernaut"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantKeywords: ["trample"],
      text: TRAMPLE_TEXT,
    },
  ],
});
