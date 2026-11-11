import { defineCard } from "../define.js";

export default defineCard({
  name: "Dawn-Blessed Pennant",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text:
    "As this artifact enters, choose Elemental, Elf, Faerie, Giant, Goblin, Kithkin, Merfolk, or Treefolk.\n" +
    "Whenever a permanent you control of the chosen type enters, you gain 1 life.\n" +
    "{2}, {T}, Sacrifice this artifact: Return target card of the chosen type from your graveyard to your hand.",
  chooseCreatureTypeOnEnter: true,
  chooseCreatureTypeMenu: ["Elemental", "Elf", "Faerie", "Giant", "Goblin", "Kithkin", "Merfolk", "Treefolk"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { ofChosenType: true } },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: "Whenever a permanent you control of the chosen type enters, you gain 1 life.",
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { ofChosenType: true } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: "{2}, {T}, Sacrifice this artifact: Return target card of the chosen type from your graveyard to your hand.",
    },
  ],
});
