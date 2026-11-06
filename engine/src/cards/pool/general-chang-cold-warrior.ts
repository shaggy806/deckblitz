import { defineCard } from "../define.js";

export default defineCard({
  name: "General Chang, Cold Warrior",
  manaCost: "{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Klingon", "Warrior", "Officer"],
  power: 1,
  toughness: 2,
  text: "{1}, Sacrifice a creature: Put a +1/+1 counter on each Klingon you control.",
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: "creature-you-control" },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { subtype: "Klingon", controlledBy: "you" },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: "{1}, Sacrifice a creature: Put a +1/+1 counter on each Klingon you control.",
    },
  ],
});
