import { defineCard } from "../define.js";

// EDHREC rank 14981.
//
// Works only while the card is in its owner's graveyard (rule 113.6k). The
// source is a red instant or sorcery *spell* the Phoenix's owner controls, or
// a red planeswalker they control (its abilities' damage is dealt by it);
// once for each opponent dealt damage, so a second trigger finds the card
// gone and does nothing.
const RETURN =
  "Whenever an opponent is dealt damage by a red instant or sorcery spell you control or by a red planeswalker you control, return this card from your graveyard to your hand.";

export default defineCard({
  name: "Chandra's Phoenix",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phoenix"],
  power: 2,
  toughness: 2,
  keywords: ["flying", "haste"],
  text: `Flying\nHaste (This creature can attack and {T} as soon as it comes under your control.)\n${RETURN}`,
  triggered: [
    {
      fromGraveyard: true,
      trigger: {
        on: "deals-damage",
        who: "you-control",
        filter: { colors: ["R"], typesAnyOf: ["instant", "sorcery", "planeswalker"] },
        to: "opponent",
      },
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: RETURN,
    },
  ],
});
