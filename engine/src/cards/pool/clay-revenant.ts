import { defineCard } from "../define.js";

// EDHREC rank 15623. Abzan Devotee's graveyard return.

const RETURN_TEXT = "{2}{B}: Return this card from your graveyard to your hand.";

export default defineCard({
  name: "Clay Revenant",
  manaCost: "{1}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 1,
  toughness: 2,
  text: `This creature enters tapped.\n${RETURN_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This creature enters tapped.",
    },
  ],
});
