import { defineCard } from "../define.js";

// EDHREC rank 30717.

const MANA_TEXT = 'Creatures you control have "{T}: Add {G}{G}."';
const MURF_TEXT = "When Rok-Tahk enters, create Murf, a legendary 0/1 green Ooze Slug creature token with indestructible.";

export default defineCard({
  name: "Rok-Tahk, Budding Scientist",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Brikar", "Scientist"],
  power: 5,
  toughness: 5,
  text: `${MANA_TEXT}\n${MURF_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: [],
          effect: { kind: "add-mana", mana: "G", amount: 2 },
          resolve: null,
          text: "{T}: Add {G}{G}.",
        },
      ],
      text: MANA_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Murf Token", count: 1 },
      resolve: null,
      text: MURF_TEXT,
    },
  ],
});
