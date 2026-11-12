import { defineCard } from "../define.js";

// EDHREC rank 14164.

export default defineCard({
  name: "Thranduil the Strategist",
  manaCost: "{3}{G}{U}",
  colors: ["G", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Noble"],
  power: 4,
  toughness: 4,
  text: "Other Elves you control have \"{T}: Add {G} or {U}.\"\nLandfall — Whenever a land you control enters, create a 1/1 green Elf creature token.",
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Elf", controlledBy: "you", isSource: false } },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: [],
          effect: { kind: "add-mana", mana: { oneOf: ["G", "U"] }, amount: 1 },
          resolve: null,
          text: "{T}: Add {G} or {U}.",
        },
      ],
      text: "Other Elves you control have \"{T}: Add {G} or {U}.\"",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: { kind: "create-token", token: "Elf Token", count: 1 },
      resolve: null,
      text: "Landfall — Whenever a land you control enters, create a 1/1 green Elf creature token.",
    },
  ],
});
