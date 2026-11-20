import { defineCard } from "../define.js";

// "Attacks a player who has more life than you" is a trigger condition
// (`defenderLife: "more-than-you"`), asked as Namor is declared an attacker
// and not again: no intervening "if" (rule 603.4). "That player" is the
// player Namor attacked (`"trigger-player"`); the creatures pumped are those
// attacking that player as the ability resolves (`attackingPlayerRef`), not
// one attacking a planeswalker of theirs.

const SPELL_TRIGGER = "Whenever you cast a noncreature spell, create a 1/1 blue Merfolk creature token.";
const ATTACK_TRIGGER =
  "Whenever Namor attacks a player who has more life than you, other creatures you control attacking that player get +2/+0 until end of turn.";

export default defineCard({
  name: "Namor, Atlantean King",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Merfolk", "Noble"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${SPELL_TRIGGER}\n${ATTACK_TRIGGER}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "create-token", token: "Merfolk Token", count: 1 },
      resolve: null,
      text: SPELL_TRIGGER,
    },
    {
      trigger: { on: "attacks", who: "self", defenderLife: "more-than-you" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you", attackingPlayerRef: "trigger-player" },
        power: 2,
        toughness: 0,
        duration: "end-of-turn",
        exceptSource: true,
      },
      resolve: null,
      text: ATTACK_TRIGGER,
    },
  ],
});
