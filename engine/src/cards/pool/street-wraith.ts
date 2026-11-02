import { defineCard } from "../define.js";

const CYCLE_TEXT = "Cycling—Pay 2 life. (Pay 2 life, Discard this card: Draw a card.)";

export default defineCard({
  name: "Street Wraith",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Wraith"],
  power: 3,
  toughness: 4,
  keywords: ["swampwalk"],
  cycling: { cost: "", also: { payLife: 2 }, costText: "Pay 2 life" },
  text: `Swampwalk (This creature can't be blocked as long as defending player controls a Swamp.)\n${CYCLE_TEXT}`,
});
