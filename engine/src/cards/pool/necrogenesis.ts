import { defineCard } from "../define.js";

export default defineCard({
  name: "Necrogenesis",
  manaCost: "{B}{G}",
  colors: ["B", "G"],
  types: ["enchantment"],
  text: "{2}: Exile target creature card from a graveyard. Create a 1/1 green Saproling creature token.",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          { kind: "create-token", token: "Saproling Token", count: 1 },
        ],
      },
      resolve: null,
      text: "{2}: Exile target creature card from a graveyard. Create a 1/1 green Saproling creature token.",
    },
  ],
});
