import { defineCard } from "../define.js";

// Marvel Super Heroes Commander (MSC). EDHREC rank 14684.
// "Is dealt damage for the first time each turn" is the timing wrapper on a
// `dealt-damage` trigger: the first damage event this turn that dealt him
// damage, sources dealing damage at once one event (rule 510.2), "that many"
// all of it. Dead from it, he gets nothing (the reminder text).

const ATTACK_TEXT = "Whenever Hercules attacks, put a +1/+1 counter on him. He gains indestructible until end of turn.";
const DAMAGE_TEXT = "Whenever Hercules is dealt damage for the first time each turn, put that many +1/+1 counters on him.";

export default defineCard({
  name: "Hercules, Olympian Hero",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Demigod", "Warrior", "Hero"],
  power: 3,
  toughness: 3,
  text: `${ATTACK_TEXT}\n${DAMAGE_TEXT} (He must survive the damage to get the counters.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: { on: "dealt-damage", who: "self", firstTimeEachTurn: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: { triggerValue: true } },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
