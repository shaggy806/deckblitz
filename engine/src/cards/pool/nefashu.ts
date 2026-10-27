import { defineCard } from "../define.js";

// EDHREC rank 20872.

export default defineCard({
  name: "Nefashu",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Mutant"],
  power: 5,
  toughness: 3,
  text: "Whenever this creature attacks, up to five target creatures each get -1/-1 until end of turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "any-number", of: "creature", max: 5 }],
      effect: {
        kind: "for-each-target",
        from: 0,
        effect: { kind: "modify-pt", target: 0, power: -1, toughness: -1, duration: "end-of-turn" },
      },
      resolve: null,
      text: "Whenever this creature attacks, up to five target creatures each get -1/-1 until end of turn.",
    },
  ],
});
