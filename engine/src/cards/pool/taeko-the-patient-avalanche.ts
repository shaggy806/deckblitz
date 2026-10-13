import { defineCard } from "../define.js";

// EDHREC rank 12397.
//
// Rulings:
//   [2024-11-08] If Taeko leaves the battlefield or dies at the same time as one or more other
//     creatures you control leave the battlefield without dying, its second ability triggers once
//     for each of those other creatures. You will scry for each of those other creatures, but
//     Taeko will not be on the battlefield to receive +1/+1 counters.
//   [2024-11-08] You don't choose a target for Taeko's last ability at the time it triggers.
//     Rather, a second "reflexive" ability triggers when you pay {U/B} this way. You choose a
//     target for that ability as it goes on the stack. Each player may respond to this triggered
//     ability as normal.

const ENTERS_TEXT = "Taeko enters tapped.";
const LEAVE_TEXT =
  "Whenever another creature you control leaves the battlefield, if it didn't die, scry 1 and put a +1/+1 counter on Taeko.";
const ATTACK_TEXT =
  "Whenever Taeko attacks, you may pay {U/B}. When you do, target attacking creature can't be blocked this turn.";

// "If it didn't die" is every destination but a graveyard (rule 700.4: dies
// means put into a graveyard from the battlefield) — fixed by where it went,
// so it reads the same on resolution. The {U/B} payment sets off a reflexive
// trigger that targets as it goes on the stack (the ruling) — Invisible
// Woman's shape.
export default defineCard({
  name: "Taeko, the Patient Avalanche",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Turtle", "Ninja"],
  power: 4,
  toughness: 5,
  text: `${ENTERS_TEXT}\n${LEAVE_TEXT}\n${ATTACK_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: ENTERS_TEXT,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "leaves-battlefield",
        who: "you-control",
        filter: { type: "creature" },
        otherOnly: true,
        to: ["exile", "hand", "library", "command"],
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "scry", amount: 1 },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: LEAVE_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {U/B} to make target attacking creature unblockable this turn?",
        cost: "{U/B}",
        effect: {
          kind: "reflexive-trigger",
          targets: [{ kind: "permanent", filter: { type: "creature", attacking: true } }],
          effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
          text: "When you do, target attacking creature can't be blocked this turn.",
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
