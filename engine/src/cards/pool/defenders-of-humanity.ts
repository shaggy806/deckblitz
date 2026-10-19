import { defineCard } from "../define.js";

// EDHREC rank 11526.
//
// The enters trigger reads the X the spell was cast with (March of the
// Canonized); the activated ability reads its own X, announced as it's
// activated — the two never share a value (the ruling). Both restrictions
// on the activation are one `all` condition (rule 602.5).

const ENTERS_TEXT =
  "When this enchantment enters, create X 2/2 white Astartes Warrior creature tokens with vigilance.";
const EXILE_TEXT =
  "{X}{2}{W}, Exile this enchantment: Create X 2/2 white Astartes Warrior creature tokens with vigilance. Activate only if you control no creatures and only during your turn.";

export default defineCard({
  name: "Defenders of Humanity",
  manaCost: "{X}{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${ENTERS_TEXT}\n${EXILE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Astartes Warrior Token", count: "x" },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{X}{2}{W}", tap: false, exileSelf: true },
      condition: {
        kind: "all",
        of: [
          { kind: "not", of: { kind: "controls", filter: { type: "creature" }, atLeast: 1 } },
          { kind: "your-turn" },
        ],
      },
      targets: [],
      effect: { kind: "create-token", token: "Astartes Warrior Token", count: "x" },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
});
