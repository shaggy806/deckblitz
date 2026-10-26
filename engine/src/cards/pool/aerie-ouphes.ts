import { defineCard } from "../define.js";
import { persist } from "../helpers.js";

// Eventide (EVE). EDHREC rank 17450.
//
// The damage is the power it had as it was sacrificed (its last known
// information), not the returned Ouphes' — a new object (the first ruling).

const SAC_TEXT = "Sacrifice this creature: It deals damage equal to its power to target creature with flying.";

export default defineCard({
  name: "Aerie Ouphes",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ouphe"],
  power: 3,
  toughness: 3,
  text: `${SAC_TEXT}\nPersist (When this creature dies, if it had no -1/-1 counters on it, return it to the battlefield under its owner's control with a -1/-1 counter on it.)`,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
      effect: { kind: "damage", amount: { powerOf: "source" }, target: 0 },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
  triggered: [persist()],
});
