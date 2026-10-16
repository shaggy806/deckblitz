import { defineCard } from "../define.js";

// Ondu Knotmaster's Adventure. "Distribute two +1/+1 counters among one or
// two target creatures" is The Earth Crystal's shape: one target takes both,
// two take one each (each target at least one — the ruling). A second target
// gone illegal by resolution loses its counter, which isn't moved to the
// other (the ruling).
//
// Rulings:
//   [2024-06-07] If you choose two targets for Throw a Line, and one of the creatures is an illegal
//     target as Throw a Line tries to resolve, the original distribution of counters still applies
//     and the counter that would have been put on the illegal target are lost.
//   [2024-06-07] You choose how the counters will be distributed as you cast Throw a Line. Each
//     target must receive at least one +1/+1 counter.

export default defineCard({
  name: "Throw a Line",
  art: "https://cards.scryfall.io/art_crop/back/2/7/27912e61-97ef-406b-bb88-4fe89a54726e.jpg",
  manaCost: "{W}{B}",
  colors: ["W", "B"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Distribute two +1/+1 counters among one or two target creatures. (Then exile this card. You may cast the creature later from exile.)",
  targets: ["creature", { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } }],
  effect: {
    kind: "conditional",
    condition: { kind: "target-chosen", index: 1 },
    then: {
      kind: "sequence",
      effects: [
        { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
        { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
      ],
    },
    else: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
  },
  faces: ["Ondu Knotmaster", "Throw a Line"],
  adventure: true,
});
