import { defineCard } from "../define.js";

// Alliances. EDHREC rank 8207.
//
// Rulings:
//   [2008-10-01] A tip on how this math works: The cost to destroy a noncreature artifact with
//     mana value 0 is {0} + {0} + {1} = {1}. The cost to destroy a noncreature artifact with mana
//     value 1 is {1} + {1} + {1} = {3}. The cost to destroy a noncreature artifact with mana value
//     2 is {2} + {2} + {1} = {5}. And so on.
//
// Dauntless Dismantler's {X}{X} cost with The Mycosynth Gardens' X in a
// target filter.

const TEXT = "{X}{X}{1}: Destroy target noncreature artifact with mana value X.";

export default defineCard({
  name: "Gorilla Shaman",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ape", "Shaman"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{X}{X}{1}", tap: false },
      targets: [
        {
          kind: "permanent",
          filter: { type: "artifact", notTypes: ["creature"], manaValue: { op: "eq", n: "x" } },
        },
      ],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
