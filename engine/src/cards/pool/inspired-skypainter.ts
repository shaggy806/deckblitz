import { defineCard } from "../define.js";
import { PREPARED_REMINDER } from "../helpers.js";

// EDHREC rank 10703. Secrets of Strixhaven Commander. A preparation card
// (rule 722): its prepare spell is Maestro's Gift, a spell with no card of
// its own (`prepareSpellOnly`). Already prepared, it doesn't become prepared
// again (the ruling) — `become-prepared` does nothing then. The damage
// trigger is batched: once per player dealt combat damage by one or more of
// your creature tokens in one damage step.
const ENTERS_TEXT =
  "When this creature enters and whenever one or more creature tokens you control deal combat damage to a player, this creature becomes prepared.";

export default defineCard({
  name: "Inspired Skypainter",
  manaCost: "{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Lizard", "Wizard"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  prepareSpell: "Maestro's Gift",
  text: `Flying\n${ENTERS_TEXT} ${PREPARED_REMINDER}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "become-prepared", target: "source" },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: {
        on: "deals-damage-batch",
        who: "you-control",
        filter: { type: "creature", token: true },
        combat: true,
      },
      targets: [],
      effect: { kind: "become-prepared", target: "source" },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
