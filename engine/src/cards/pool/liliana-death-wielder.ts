import { defineCard } from "../define.js";

// Amonkhet. EDHREC rank 7880.

export default defineCard({
  name: "Liliana, Death Wielder",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Liliana"],
  loyalty: 5,
  text: "+2: Put a -1/-1 counter on up to one target creature.\n−3: Destroy target creature with a -1/-1 counter on it.\n−10: Return all creature cards from your graveyard to the battlefield.",
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "add-counter", target: 0, counter: "-1/-1", amount: 1 },
      resolve: null,
      text: "+2: Put a -1/-1 counter on up to one target creature.",
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", counters: { kind: "-1/-1", compare: { op: "gte", n: 1 } } } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "−3: Destroy target creature with a -1/-1 counter on it.",
    },
    {
      loyaltyCost: -10,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "return-from-graveyard", filter: { type: "creature" }, destination: "battlefield", count: "all" },
      resolve: null,
      text: "−10: Return all creature cards from your graveyard to the battlefield.",
    },
  ],
});
