import { defineCard } from "../define.js";

// EDHREC rank 12610. Exert is part of the cost (rule 701.43 —
// Steward of Solidarity's shape). The cycle trigger resolves before the
// cycling draw, and grants to the Cats you control as it resolves (rule
// 611.2c).

const TOKEN_TEXT = "{W}, {T}, Exert Basri: Create a 1/1 white Cat creature token with lifelink.";
const CYCLE_TEXT = "When you cycle this card, Cats you control gain hexproof and indestructible until end of turn.";

export default defineCard({
  name: "Basri, Tomorrow's Champion",
  manaCost: "{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 1,
  cycling: { cost: "{2}{W}" },
  text: `${TOKEN_TEXT} (An exerted creature won't untap during your next untap step.)\nCycling {2}{W} ({2}{W}, Discard this card: Draw a card.)\n${CYCLE_TEXT}`,
  activated: [
    {
      cost: { mana: "{W}", tap: true, exertSelf: true },
      targets: [],
      effect: { kind: "create-token", token: "Lifelink Cat Token", count: 1 },
      resolve: null,
      text: TOKEN_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "this-cycled" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "grant-keyword-all",
            filter: { subtype: "Cat", controlledBy: "you" },
            keyword: "hexproof",
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword-all",
            filter: { subtype: "Cat", controlledBy: "you" },
            keyword: "indestructible",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: CYCLE_TEXT,
    },
  ],
});
