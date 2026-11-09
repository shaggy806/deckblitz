import { defineCard } from "../define.js";

const TEXT = "When this creature enters, flip a coin until you lose a flip. Put a +1/+1 counter on this creature for each flip you won.";

// EDHREC rank 18585. One placement of as many counters, the wins counted over
// all the flips (`thisWay: "flips-won"`).
export default defineCard({
  name: "Crazed Firecat",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Cat"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "repeat", effect: { kind: "flip-coin" }, again: { kind: "this-way", what: "flips-won" } },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: { thisWay: "flips-won" } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
