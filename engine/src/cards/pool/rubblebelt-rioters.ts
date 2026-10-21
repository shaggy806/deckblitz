import { defineCard } from "../define.js";

// EDHREC rank 18334. X is read once, as the trigger resolves, among all the
// creatures you control — this one included (the rulings; Orcish Siegemaster's
// shape).

export default defineCard({
  name: "Rubblebelt Rioters",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Human", "Berserker"],
  power: 0,
  toughness: 4,
  keywords: ["haste"],
  text: "Haste\nWhenever this creature attacks, it gets +X/+0 until end of turn, where X is the greatest power among creatures you control.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { aggregate: "max", of: "power", filter: { type: "creature", controlledBy: "you" } },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Whenever this creature attacks, it gets +X/+0 until end of turn, where X is the greatest power among creatures you control.",
    },
  ],
});
