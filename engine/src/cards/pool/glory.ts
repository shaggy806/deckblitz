import { defineCard } from "../define.js";

// EDHREC rank 12370. Activated from the graveyard, where it stays (Carrionette's
// shape); the creatures are those you control as it resolves.

export default defineCard({
  name: "Glory",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Incarnation"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\n{2}{W}: Choose a color. Creatures you control gain protection from the chosen color until end of turn. Activate only if this card is in your graveyard.",
  activated: [
    {
      cost: { mana: "{2}{W}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: {
        kind: "grant-protection",
        filter: { type: "creature", controlledBy: "you" },
        from: { choose: "color" },
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{2}{W}: Choose a color. Creatures you control gain protection from the chosen color until end of turn. Activate only if this card is in your graveyard.",
    },
  ],
});
