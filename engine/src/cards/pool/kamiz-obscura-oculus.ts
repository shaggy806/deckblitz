import { defineCard } from "../define.js";

const ATTACK_TEXT =
  "Whenever you attack, target attacking creature can't be blocked this turn. It connives. Then choose another attacking creature with lesser power. That creature gains double strike until end of turn.";

// The second creature is chosen, not targeted, as the ability resolves —
// after the connive, so "lesser power" is against the target's power with
// any +1/+1 counter it just got. A creature can't have less power than
// itself, so "another" needs nothing more. The choice is mandatory when one
// qualifies.
export default defineCard({
  name: "Kamiz, Obscura Oculus",
  manaCost: "{1}{W}{U}{B}",
  colors: ["W", "U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Octopus", "Rogue"],
  power: 2,
  toughness: 4,
  text: `${ATTACK_TEXT} (To have a creature connive, draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on that creature.)`,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
          { kind: "connive", target: 0 },
          {
            kind: "choose-permanents",
            filter: { type: "creature", attacking: true, power: { op: "lt", n: { amount: { powerOf: 0 } } } },
            min: 1,
            upTo: 1,
            then: { kind: "grant-keyword", target: 0, keyword: "double-strike", duration: "end-of-turn" },
            prompt: "Choose another attacking creature with lesser power to gain double strike",
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
