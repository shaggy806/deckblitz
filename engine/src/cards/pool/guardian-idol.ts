import { defineCard } from "../define.js";

// EDHREC rank 8235. Fifth Dawn.
//
// "Becomes a 2/2 Golem artifact creature" sets its types and creature type
// (rule 205.1a); it has no other subtypes to lose. Counters on it stay while
// it isn't a creature and count again once it is (the ruling).

export default defineCard({
  name: "Guardian Idol",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "This artifact enters tapped.\n{T}: Add {C}.\n{2}: This artifact becomes a 2/2 Golem artifact creature until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 2,
        toughness: 2,
        addTypes: ["artifact", "creature"],
        addSubtypes: [],
        setSubtypes: ["Golem"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{2}: This artifact becomes a 2/2 Golem artifact creature until end of turn.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This artifact enters tapped.",
    },
  ],
});
