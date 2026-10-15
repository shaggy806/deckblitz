import { defineCard } from "../define.js";

// EDHREC rank 7370.
//
// Cryptic Command's `tap-all` on an enters trigger; Enduring Curiosity's
// per-creature combat damage draw.
const ENTER_TEXT = "When Ultimecia enters, tap all creatures your opponents control.";
const DRAW_TEXT = "Whenever a creature you control deals combat damage to a player, draw a card.";

export default defineCard({
  name: "Ultimecia, Temporal Threat",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 4,
  toughness: 4,
  text: `${ENTER_TEXT}\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "tap-all", filter: { type: "creature", controlledBy: "opponent" } },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
