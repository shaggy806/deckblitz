import { defineCard } from "../define.js";

// EDHREC rank 22175. Exiled linked to this (rule 607.2a); sacrificing it puts
// each *creature* card among them (the ruling) onto the battlefield under its
// controller's control. A token exiled ceases to exist; leaving any other way,
// the cards stay exiled (the rulings).
//
// Rulings:
//   If this card leaves the battlefield, the cards it exiled remain exiled.
//   If it exiles a token creature, the token ceases to exist and will not return.
//   … only cards that actually have the type Creature will get returned.

const EXILE_TEXT = "{3}: Exile target creature you control.";
const SAC_TEXT = "Sacrifice this artifact: Return each creature card exiled with this artifact to the battlefield under your control.";

export default defineCard({
  name: "Cold Storage",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: `${EXILE_TEXT}\n${SAC_TEXT}`,
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "exile", target: 0, linked: true },
      resolve: null,
      text: EXILE_TEXT,
    },
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source", linked: "battlefield", under: "you", filter: { type: "creature" } },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
