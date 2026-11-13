import { defineCard } from "../define.js";

// It triggers as your untap step untaps it (rule 502.3) — not another
// player's untap step (Seedborn Muse), nor an untap at any other time — and,
// nobody getting priority in an untap step, goes on the stack at the start
// of the next step, the upkeep: the additional upkeep comes after that one
// (the card's ruling; rule 500.10).
const TARDIS_TEXT =
  "Into the TARDIS — Whenever The Ninth Doctor becomes untapped during your untap step, you get an additional upkeep step after this step.";

export default defineCard({
  name: "The Ninth Doctor",
  manaCost: "{1}{U}{R}",
  colors: ["R", "U"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Time Lord", "Doctor"],
  power: 2,
  toughness: 4,
  keywords: ["haste"],
  text: `Haste\n${TARDIS_TEXT}`,
  triggered: [
    {
      trigger: { on: "event", event: "untaps-during-untap-step", who: "self", by: "you" },
      targets: [],
      effect: { kind: "additional-upkeep-step", who: "you" },
      resolve: null,
      text: TARDIS_TEXT,
    },
  ],
});
