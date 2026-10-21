import { defineCard } from "../define.js";

// Populate after the exile, in one resolution: an illegal target stops the
// whole ability (its ruling — no populate), which the targeting rules do.

export default defineCard({
  name: "Selesnya Eulogist",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Centaur", "Druid"],
  power: 3,
  toughness: 3,
  text: "{2}{G}: Exile target creature card from a graveyard, then populate. (Create a token that's a copy of a creature token you control.)",
  activated: [
    {
      cost: { mana: "{2}{G}", tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } }],
      effect: { kind: "sequence", effects: [{ kind: "exile", target: 0 }, { kind: "populate" }] },
      resolve: null,
      text: "{2}{G}: Exile target creature card from a graveyard, then populate.",
    },
  ],
});
