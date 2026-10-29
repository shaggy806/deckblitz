import { defineCard } from "../define.js";

// EDHREC rank 3030.
//
// "Each artifact creature and/or Vehicle you control": a Vehicle that isn't a
// creature right now gets a counter too.

export default defineCard({
  name: "Iron Spider, Stark Upgrade",
  manaCost: "{3}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Spider", "Hero"],
  power: 2,
  toughness: 3,
  keywords: ["vigilance"],
  text: "Vigilance\n{T}: Put a +1/+1 counter on each artifact creature and/or Vehicle you control.\n{2}, Remove two +1/+1 counters from among artifacts you control: Draw a card.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { controlledBy: "you", anyOf: [{ types: ["artifact", "creature"] }, { subtype: "Vehicle" }] },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: "{T}: Put a +1/+1 counter on each artifact creature and/or Vehicle you control.",
    },
    {
      cost: {
        mana: "{2}",
        tap: false,
        removeCounter: { kind: "+1/+1", count: 2, from: { type: "artifact" }, among: true },
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{2}, Remove two +1/+1 counters from among artifacts you control: Draw a card.",
    },
  ],
});
