import { annihilator } from "../helpers.js";
import { defineCard } from "../define.js";

// EDHREC rank 9958. Metalwork Colossus's graveyard return: the card isn't
// part of the cost (`staysInZone`), and the two Eldrazi are chosen as the
// cost is paid.
const ANNIHILATOR_TEXT =
  "Annihilator 1 (Whenever this creature attacks, defending player sacrifices a permanent of their choice.)";
const RETURN_TEXT = "Sacrifice two Eldrazi: Return this card from your graveyard to your hand.";

export default defineCard({
  name: "Eldrazi Ravager",
  manaCost: "{5}{C}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 6,
  toughness: 6,
  cycling: { cost: "{2}" },
  text: `${ANNIHILATOR_TEXT}\n${RETURN_TEXT}\nCycling {2} ({2}, Discard this card: Draw a card.)`,
  triggered: [annihilator(1)],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { subtype: "Eldrazi" }, count: 2 } },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
