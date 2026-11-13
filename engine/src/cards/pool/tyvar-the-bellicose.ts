import { defineCard } from "../define.js";

const ATTACK_TEXT = "Whenever one or more Elves you control attack, they gain deathtouch until end of turn.";
// Each creature's own ability, triggering once each turn for each of them
// (the rulings); not a mana ability itself, so it uses the stack, above a
// spell the mana paid for. "The amount of mana this creature produced" is
// what its mana ability made, a tap doubler's included.
const GRANTED_TEXT =
  "Whenever a mana ability of this creature resolves, put a number of +1/+1 counters on it equal to the amount of mana this creature produced. This ability triggers only once each turn.";
const GRANT_TEXT = `Each creature you control has "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Tyvar the Bellicose",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Elf", "Warrior"],
  power: 5,
  toughness: 4,
  text: `${ATTACK_TEXT}\n${GRANT_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks-batch", who: "you", filter: { subtype: "Elf" } },
      targets: [],
      effect: { kind: "grant-keyword-all", filter: { inSet: "trigger-batch" }, keyword: "deathtouch", duration: "end-of-turn" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you" } },
      grantsTriggered: [
        {
          trigger: { on: "event", event: "mana-ability-resolves", who: "self" },
          oncePerTurn: true,
          targets: [],
          effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: { triggerValue: true } },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
