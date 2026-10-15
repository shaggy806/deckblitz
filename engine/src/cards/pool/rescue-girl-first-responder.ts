import { defineCard } from "../define.js";

// EDHREC rank 25019.

const BOUNCE_TEXT =
  "{T}: Return another target permanent you control to its owner's hand. Activate only during your turn.";

export default defineCard({
  name: "Rescue Girl, First Responder",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${BOUNCE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      condition: { kind: "your-turn" },
      targets: [{ kind: "other", of: { kind: "permanent", whose: "you", filter: {} } }],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: BOUNCE_TEXT,
    },
  ],
});
