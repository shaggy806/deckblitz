import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// EDHREC rank 11726. Streets of New Capenna Commander.
//
// Support 6 (rule 701.41a): each of up to six **other** target creatures,
// any player's, one counter each (Aerie Auxiliary's shape). "Attacks one of
// your opponents" is `attackingOpponent`: the player, not a planeswalker or
// battle of theirs (rule 508.3a), whoever controls the attacker.
const SUPPORT_TEXT =
  "When this creature enters, support 6. (Put a +1/+1 counter on each of up to six other target creatures.)";
const ATTACK_TEXT =
  "Whenever a creature with a counter on it attacks one of your opponents, that creature gains flying until end of turn.";

export default defineCard({
  name: "Skyboon Evangelist",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Advisor"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${SUPPORT_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: distinctTargets(6, { kind: "other", of: "creature" }, { optional: true }),
      effect: {
        kind: "sequence", together: true,
        effects: [0, 1, 2, 3, 4, 5].map((target) => ({
          kind: "add-counter" as const,
          target,
          counter: "+1/+1",
          amount: 1,
        })),
      },
      resolve: null,
      text: SUPPORT_TEXT,
    },
    {
      trigger: {
        on: "attacks",
        who: "any",
        filter: { type: "creature", counters: { compare: { op: "gte", n: 1 } }, attackingOpponent: true },
      },
      targets: [],
      effect: { kind: "grant-keyword", target: "trigger-object", keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
