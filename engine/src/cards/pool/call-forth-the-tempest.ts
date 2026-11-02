import { defineCard } from "../define.js";
import type { TriggeredAbility } from "../../abilities.js";

// Two instances of cascade, each triggering separately (rule 702.85c), and what
// they cast is among the "other spells", resolving before this one does.
const CASCADE: TriggeredAbility = {
  trigger: { on: "this-cast" },
  targets: [],
  effect: { kind: "cascade" },
  resolve: null,
  text: "Cascade.",
};

export default defineCard({
  name: "Call Forth the Tempest",
  manaCost: "{5}{R}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Cascade, cascade (When you cast this spell, exile cards from the top of your library until you exile a nonland card that costs less. You may cast it without paying its mana cost. Put the exiled cards on the bottom of your library in a random order. Then do it again.)\nCall Forth the Tempest deals damage to each creature your opponents control equal to the total mana value of other spells you've cast this turn.",
  triggered: [CASCADE, CASCADE],
  targets: [],
  effect: {
    kind: "damage-all",
    filter: { type: "creature", controlledBy: "opponent" },
    amount: { castThisTurn: {}, total: "mana-value", other: true },
  },
});
