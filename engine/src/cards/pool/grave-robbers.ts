import { defineCard } from "../define.js";

export default defineCard({
  name: "Grave Robbers",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 1,
  toughness: 1,
  text: "{B}, {T}: Exile target artifact card from a graveyard. You gain 2 life.",
  activated: [
    {
      cost: { mana: "{B}", tap: true },
      targets: [{ kind: "card-in-graveyard", whose: "any", filter: { type: "artifact" } }],
      effect: {
        kind: "sequence",
        effects: [{ kind: "exile", target: 0 }, { kind: "gain-life", amount: 2 }],
      },
      resolve: null,
      text: "{B}, {T}: Exile target artifact card from a graveyard. You gain 2 life.",
    },
  ],
});
