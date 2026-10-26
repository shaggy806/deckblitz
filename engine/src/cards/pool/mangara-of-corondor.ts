import { defineCard } from "../define.js";

// EDHREC rank 13526.
//
// Rulings: if Mangara has left the battlefield, the target is still exiled and
// Mangara isn't (`"source"` names it as it was when the ability went on the
// stack); an illegal target means the ability doesn't resolve at all.

export default defineCard({
  name: "Mangara of Corondor",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: "{T}: Exile Mangara and target permanent.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["permanent"],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "exile", target: "source" },
          { kind: "exile", target: 0 },
        ],
      },
      resolve: null,
      text: "{T}: Exile Mangara and target permanent.",
    },
  ],
});
