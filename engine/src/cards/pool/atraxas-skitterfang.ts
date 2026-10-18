import { defineCard } from "../define.js";

// EDHREC rank 10849.
//
// Rulings:
//   [2023-02-04] You don't choose a target for Atraxa's Skitterfang's last ability at the time it
//     triggers. Rather, a second "reflexive" ability triggers when you remove an oil counter this
//     way. You choose a target for that ability as it goes on the stack. Each player may respond
//     to this triggered ability as normal.
//   [2023-02-04] You choose which ability the target creature gets as the reflexive ability
//     resolves. Players may not wait to see what ability you choose before deciding whether to
//     respond to it.

// "You may remove an oil counter" is Nazar's shape: offered only while the
// Skitterfang is on the battlefield with one to remove. "When you do" is a
// reflexive trigger that targets as it goes on the stack, and its "your
// choice" is a `modal` asked as it resolves (the second ruling).
const ENTERS_TEXT = "This creature enters with three oil counters on it.";
const COMBAT_TEXT =
  "At the beginning of combat on your turn, you may remove an oil counter from this creature. When you do, target creature you control gains your choice of flying, vigilance, deathtouch, or lifelink until end of turn.";
const REFLEXIVE_TEXT =
  "When you do, target creature you control gains your choice of flying, vigilance, deathtouch, or lifelink until end of turn.";

export default defineCard({
  name: "Atraxa's Skitterfang",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Insect"],
  power: 2,
  toughness: 2,
  text: `${ENTERS_TEXT}\n${COMBAT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "oil", amount: 3 } },
      text: ENTERS_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: {
          kind: "all",
          of: [
            { kind: "source-on-battlefield" },
            { kind: "self-counters", counter: "oil", compare: { op: "gte", n: 1 } },
          ],
        },
        then: {
          kind: "may",
          prompt: "Remove an oil counter from Atraxa's Skitterfang?",
          effect: { kind: "remove-counter", target: "source", counter: "oil", amount: 1 },
          then: {
            kind: "reflexive-trigger",
            targets: ["creature-you-control"],
            effect: {
              kind: "modal",
              minModes: 1,
              maxModes: 1,
              modes: [
                { text: "Flying", effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" } },
                {
                  text: "Vigilance",
                  effect: { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "end-of-turn" },
                },
                {
                  text: "Deathtouch",
                  effect: { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" },
                },
                {
                  text: "Lifelink",
                  effect: { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
                },
              ],
            },
            text: REFLEXIVE_TEXT,
          },
        },
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
