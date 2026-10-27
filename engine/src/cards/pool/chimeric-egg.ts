import { defineCard } from "../define.js";

// EDHREC rank 23629.
//
// Rulings:
//   [2008-08-01] A noncreature permanent that turns into a creature can attack, and its {T}
//     abilities can be activated, only if its controller has continuously controlled that
//     permanent since the beginning of their most recent turn. It doesn't matter how long the
//     permanent has been a creature.

export default defineCard({
  name: "Chimeric Egg",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "Whenever an opponent casts a nonartifact spell, put a charge counter on this artifact.\nRemove three charge counters from this artifact: This artifact becomes a 6/6 Construct artifact creature with trample until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "charge", count: 3 } },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 6,
        toughness: 6,
        addTypes: ["artifact", "creature"],
        addSubtypes: [],
        setSubtypes: ["Construct"],
        keywords: ["trample"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Remove three charge counters from this artifact: This artifact becomes a 6/6 Construct artifact creature with trample until end of turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent", filter: { notTypes: ["artifact"] } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      resolve: null,
      text: "Whenever an opponent casts a nonartifact spell, put a charge counter on this artifact.",
    },
  ],
});
