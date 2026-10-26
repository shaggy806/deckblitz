import { defineCard } from "../define.js";

// EDHREC rank 21289.
//
// Rulings:
//   Since it is exiled as part of the effect and not part of the cost, you can activate its
//   ability more than once.
//   A creature with protection from creatures can't be targeted by this card's ability.

export default defineCard({
  name: "Carrionette",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Skeleton"],
  power: 1,
  toughness: 1,
  text: "{2}{B}{B}: Exile this card and target creature unless that creature's controller pays {2}. Activate only if this card is in your graveyard.",
  activated: [
    {
      cost: { mana: "{2}{B}{B}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      targets: ["creature"],
      effect: {
        kind: "unless",
        chooser: 0,
        options: [{ pay: "{2}", text: "Pay {2}" }],
        otherwise: {
          kind: "sequence",
          simultaneous: true,
          effects: [
            { kind: "exile", target: "source" },
            { kind: "exile", target: 0 },
          ],
        },
      },
      resolve: null,
      text: "{2}{B}{B}: Exile this card and target creature unless that creature's controller pays {2}. Activate only if this card is in your graveyard.",
    },
  ],
});
