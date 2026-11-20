import { defineCard } from "../define.js";
import { encoreAbility } from "../helpers.js";

// "Another target creature attacking the same player or planeswalker" is a
// creature attacking what this creature is attacking (`attackingSameAsSource`),
// any player's creature, checked as the target is chosen and again as the
// ability resolves (rule 608.2b).

const ATTACKS =
  "Whenever this creature attacks, another target creature attacking the same player or planeswalker gains flying until end of turn.";

export default defineCard({
  name: "Kitesail Skirmisher",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 3,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${ATTACKS}\nEncore {4}{U} ({4}{U}, Exile this card from your graveyard: For each opponent, create a token copy that attacks that opponent this turn if able. They gain haste. Sacrifice them at the beginning of the next end step. Activate only as a sorcery.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "other", of: { kind: "permanent", filter: { type: "creature", attackingSameAsSource: true } } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: ATTACKS,
    },
  ],
  activated: [encoreAbility("{4}{U}")],
});
