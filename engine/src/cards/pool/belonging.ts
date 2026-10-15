import { defineCard } from "../define.js";

// EDHREC rank 7328.
// Makes Shapeshifter → "Shapeshifter Token".
//
// Rulings:
//   Encore is an activated ability that functions from the graveyard. The tokens copy only what's
//     on the original card. Opponents who have left the game aren't counted. Each token must
//     attack the appropriate player if able.
//
// Lamentation's encore (`zone: "graveyard"` makes exiling this card the
// implicit cost).

const ENTER_TEXT =
  "When this creature enters, create three 1/1 colorless Shapeshifter creature tokens with changeling.";
const ENCORE_TEXT =
  "Encore {6}{W}{W} ({6}{W}{W}, Exile this card from your graveyard: For each opponent, create a token copy that attacks that opponent this turn if able. They gain haste. Sacrifice them at the beginning of the next end step. Activate only as a sorcery.)";

export default defineCard({
  name: "Belonging",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elemental", "Incarnation"],
  power: 6,
  toughness: 6,
  text: `${ENTER_TEXT} (They're every creature type.)\n${ENCORE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Shapeshifter Token", count: 3 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{6}{W}{W}", tap: false },
      zone: "graveyard",
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "encore" },
      resolve: null,
      text: ENCORE_TEXT,
    },
  ],
});
