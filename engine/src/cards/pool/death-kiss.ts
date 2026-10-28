import { defineCard } from "../define.js";

// EDHREC rank 4673.
//
// "Attacks one of your opponents": an attack on a player (`defender:
// "player"`) other than you (`attackingYou: false` on the attacker) — every
// other player is an opponent. Doubling is +X/+0, X its power as it resolves
// (the ruling). The goad group's bound is the monstrosity X, carried by the
// becomes-monstrous trigger as its value.

const ATTACK_TEXT =
  "Whenever a creature an opponent controls attacks one of your opponents, double its power until end of turn.";
const MONSTROSITY_TEXT =
  "{X}{X}{R}: Monstrosity X. (If this creature isn't monstrous, put X +1/+1 counters on it and it becomes monstrous.)";
const GOAD_TEXT = "When this creature becomes monstrous, goad up to X target creatures your opponents control.";

export default defineCard({
  name: "Death Kiss",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Beholder"],
  power: 5,
  toughness: 5,
  text: `${ATTACK_TEXT}\n${MONSTROSITY_TEXT}\n${GOAD_TEXT}`,
  activated: [
    {
      cost: { mana: "{X}{X}{R}", tap: false },
      targets: [],
      effect: { kind: "monstrosity", amount: "x" },
      resolve: null,
      text: MONSTROSITY_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "opponent", defender: "player", filter: { attackingYou: false } },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "trigger-object",
        power: { powerOf: "trigger-object", doubling: true },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: { on: "becomes-monstrous", who: "self" },
      targets: [{ kind: "any-number", of: "creature-an-opponent-controls", max: { triggerValue: true } }],
      effect: { kind: "for-each-target", from: 0, effect: { kind: "goad", target: 0 } },
      resolve: null,
      text: GOAD_TEXT,
    },
  ],
});
