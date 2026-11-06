import { defineCard } from "../define.js";

const ENTER =
  "When this creature enters, choose one —\n• You gain 3 life.\n• Surveil 2. (Look at the top two cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)";

export default defineCard({
  name: "Rogue Artificial Intelligence",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 6,
  toughness: 5,
  cycling: { cost: "{2}", search: { supertype: "basic", type: "land" } },
  text: `${ENTER}\nBasic landcycling {2} ({2}, Discard this card: Search your library for a basic land card, reveal it, put it into your hand, then shuffle.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          { effect: { kind: "gain-life", amount: 3 }, text: "You gain 3 life." },
          { effect: { kind: "surveil", amount: 2 }, text: "Surveil 2." },
        ],
      },
      resolve: null,
      text: ENTER,
    },
  ],
});
