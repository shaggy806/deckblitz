import { defineCard } from "../define.js";

// EDHREC rank 15719. Ghirapur Guide's restriction on itself; blocks already
// made stand (the rulings).

const STOMP = "{3}{G}: This creature can't be blocked by creatures with power 2 or less this turn.";

export default defineCard({
  name: "Cavern Stomper",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 7,
  toughness: 7,
  text: `When this creature enters, scry 2. (Look at the top two cards of your library, then put any number of them on the bottom and the rest on top in any order.)\n${STOMP}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "scry", amount: 2 },
      resolve: null,
      text: "When this creature enters, scry 2.",
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{G}", tap: false },
      targets: [],
      effect: {
        kind: "restrict",
        target: "source",
        restrictions: [],
        cantBeBlockedBy: { power: { op: "lte", n: 2 } },
      },
      resolve: null,
      text: STOMP,
    },
  ],
});
