import { defineCard } from "../define.js";

export default defineCard({
  name: "The Necrobloom",
  manaCost: "{1}{W}{B}{G}",
  colors: ["W", "B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Plant"],
  power: 2,
  toughness: 7,
  text: "Landfall — Whenever a land you control enters, create a 0/1 green Plant creature token. If you control seven or more lands with different names, create a 2/2 black Zombie creature token instead.\nLand cards in your graveyard have dredge 2. (You may return a land card from your graveyard to your hand and mill two cards instead of drawing a card.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      // "Instead" asked as it resolves: lands that entered together all count
      // (the ruling).
      effect: {
        kind: "conditional",
        condition: { kind: "controls", filter: { type: "land" }, atLeast: 7, distinctNames: true },
        then: { kind: "create-token", token: "Zombie Token", count: 1 },
        else: { kind: "create-token", token: "Plant Token", count: 1 },
      },
      resolve: null,
      text: "Landfall — Whenever a land you control enters, create a 0/1 green Plant creature token. If you control seven or more lands with different names, create a 2/2 black Zombie creature token instead.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantsToGraveyard: { filter: { type: "land" }, dredge: 2 },
      text: "Land cards in your graveyard have dredge 2.",
    },
  ],
});
