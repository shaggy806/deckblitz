import { defineCard } from "../define.js";

export default defineCard({
  name: "Myr Reservoir",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "{T}: Add {C}{C}. Spend this mana only to cast Myr spells or activate abilities of Myr.\n{3}, {T}: Return target Myr card from your graveyard to your hand.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "C",
        amount: 2,
        spendOnly: {
          spell: { subtype: "Myr" },
          abilityOf: { subtype: "Myr" },
          text: "Spend this mana only to cast Myr spells or activate abilities of Myr.",
        },
      },
      resolve: null,
      text: "{T}: Add {C}{C}. Spend this mana only to cast Myr spells or activate abilities of Myr.",
    },
    {
      cost: { mana: "{3}", tap: true },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { subtype: "Myr" } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: "{3}, {T}: Return target Myr card from your graveyard to your hand.",
    },
  ],
});
