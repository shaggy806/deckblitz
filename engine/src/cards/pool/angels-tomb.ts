import { defineCard } from "../define.js";

// Rulings:
//   [2015-06-22] If Angel's Tomb is already a creature when a creature enters the battlefield
//     under your control, its ability will override any effects that set its base power and
//     toughness to specific values, but other changes to its power and toughness will still apply.

const TEXT =
  "Whenever a creature you control enters, you may have this artifact become a 3/3 white Angel artifact creature with flying until end of turn.";

export default defineCard({
  name: "Angel's Tomb",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Have Angel's Tomb become a 3/3 white Angel artifact creature with flying until end of turn?",
        effect: {
          kind: "animate",
          target: "source",
          power: 3,
          toughness: 3,
          addTypes: ["artifact", "creature"],
          addSubtypes: ["Angel"],
          setColors: ["W"],
          keywords: ["flying"],
          duration: "end-of-turn",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
