import { defineCard } from "../define.js";

// EDHREC rank 17876.
//
// "During combat before blockers are declared" is the beginning of combat and
// declare attackers steps (Panic's timing). X is capped as it's announced
// (601.2b, `maxX`) by the snow lands its caster controls then.
//
// "Its controller may pay {1} or {2}" is asked as a payment of {1} and then,
// once that's paid, of {1} more: the same three outcomes — nothing paid
// (destroyed at end of combat), {1} (its combat damage prevented this
// combat) or {2} (neither) — with nothing happening between the two asks.

const TIMING_TEXT = "Cast this spell only during combat before blockers are declared.";
const X_TEXT = "X can't be greater than the number of snow lands you control.";
const EFFECT_TEXT =
  "Choose X target attacking creatures. For each of those creatures, its controller may pay {1} or {2}. If that player doesn't, destroy that creature at end of combat. If that player pays only {1}, prevent all combat damage that would be dealt to and dealt by that creature this combat.";

export default defineCard({
  name: "Winter's Chill",
  manaCost: "{X}{U}",
  colors: ["U"],
  types: ["instant"],
  text: `${TIMING_TEXT}\n${X_TEXT}\n${EFFECT_TEXT}`,
  castOnlyIf: { kind: "turn-structure", steps: ["begin-combat", "declare-attackers"] },
  maxX: { countOf: { type: "land", supertype: "snow", controlledBy: "you" } },
  targets: [
    {
      kind: "any-number",
      of: { kind: "permanent", filter: { type: "creature", attacking: true } },
      min: "x",
      max: "x",
    },
  ],
  effect: {
    kind: "for-each-target",
    from: 0,
    effect: {
      kind: "unless",
      chooser: 0,
      options: [
        {
          pay: "{1}",
          text: "Pay {1} (of {1} or {2})",
          ifPaid: {
            kind: "unless",
            chooser: 0,
            options: [{ pay: "{1}", text: "Pay {1} more ({2} in all)" }],
            otherwise: {
              kind: "sequence",
              effects: [
                { kind: "damage-rule", to: { target: 0 }, combat: true, duration: "until-end-of-combat" },
                { kind: "damage-rule", by: { target: 0 }, combat: true, duration: "until-end-of-combat" },
              ],
            },
          },
        },
      ],
      otherwise: {
        kind: "delayed-trigger",
        at: { step: "end-combat" },
        effect: { kind: "destroy", target: 0 },
        text: "Destroy that creature.",
      },
    },
  },
});
