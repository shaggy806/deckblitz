import { defineCard } from "../define.js";

// EDHREC rank 14946.
//
// Mister Fantastic's beginning-of-combat intervening if. "When you do" is a
// reflexive trigger (rule 603.12) that only follows a counter actually put
// on Lockjaw — not one that has left the battlefield in response — and it
// is the reflexive ability that targets: "up to one other" is an optional
// slot that can't name Lockjaw, who isn't targeted at all.

const COMBAT_TEXT =
  "At the beginning of combat on your turn, if you've cast a noncreature spell this turn, put a +1/+1 counter on Lockjaw. When you do, Lockjaw and up to one other target creature you control can't be blocked this turn.";
const WHEN_YOU_DO = "Lockjaw and up to one other target creature you control can't be blocked this turn.";

export default defineCard({
  name: "Lockjaw, Slobbering Teleporter",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Inhuman", "Dog", "Hero"],
  power: 1,
  toughness: 1,
  keywords: ["vigilance"],
  text: `Vigilance\n${COMBAT_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      condition: { kind: "cast-this-turn", filter: { notTypes: ["creature"] } },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source-on-battlefield" },
        then: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
            {
              kind: "reflexive-trigger",
              targets: [{ kind: "optional", of: { kind: "other", of: "creature-you-control" } }],
              effect: {
                kind: "sequence",
                effects: [
                  { kind: "grant-keyword", target: "source", keyword: "unblockable", duration: "end-of-turn" },
                  { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
                ],
              },
              text: WHEN_YOU_DO,
            },
          ],
        },
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
