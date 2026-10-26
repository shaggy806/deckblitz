import { defineCard } from "../define.js";

// EDHREC rank 21818.
//
// Rulings:
//   [2011-06-01] Once Greenhilt Trainee's ability is activated, it will resolve as normal even if
//     Greenhilt Trainee's power is less than 4 at that time.
const TEXT =
  "{T}: Target creature gets +4/+4 until end of turn. Activate only if this creature's power is 4 or greater.";

export default defineCard({
  name: "Greenhilt Trainee",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 2,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      condition: { kind: "source", filter: { power: { op: "gte", n: 4 } } },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: 4, toughness: 4, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
