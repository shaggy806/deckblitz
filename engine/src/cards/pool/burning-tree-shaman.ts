import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 22629.
//
// "Whenever a player activates" is one ability over two trigger events — an
// ability you activate and one an opponent activates — so two entries, the
// second `sameAbilityAs` the first. `activates-ability` never sees a mana
// ability (rule 605.3b), and unnarrowed it sees every ability that uses the
// stack, from any zone (loyalty abilities and cycling included).
//
// Rulings:
//   [2006-02-01] A mana ability is an ability that adds mana, not one that costs mana to activate.
//   [2013-04-15] A mana ability is an ability that (1) isn't a loyalty ability, (2) doesn't
//     target, and (3) could add mana when it resolves.

const TEXT = "Whenever a player activates an ability that isn't a mana ability, this creature deals 1 damage to that player.";

const triggered: TriggeredAbility[] = (["you", "opponent"] as const).map((who, i) => ({
  trigger: { on: "activates-ability", who },
  ...(i === 1 ? { sameAbilityAs: 0 } : {}),
  targets: [],
  effect: { kind: "damage", amount: 1, who: "trigger-player" },
  resolve: null,
  text: TEXT,
}));

export default defineCard({
  name: "Burning-Tree Shaman",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Centaur", "Shaman"],
  power: 3,
  toughness: 4,
  text: TEXT,
  triggered,
});
