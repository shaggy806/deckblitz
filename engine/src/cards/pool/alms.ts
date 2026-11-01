import { defineCard } from "../define.js";

// Graveyard order (rule 404.2): an `exileFromGraveyard` cost with `fromTop`, which is no choice.

const TEXT = "{1}, Exile the top card of your graveyard: Prevent the next 1 damage that would be dealt to target creature this turn.";

export default defineCard({
  name: "Alms",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: false, exileFromGraveyard: { count: 1, fromTop: true } },
      targets: ["creature"],
      effect: { kind: "prevent-damage", target: 0, amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
