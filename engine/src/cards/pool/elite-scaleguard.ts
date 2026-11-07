import { defineCard } from "../define.js";

// Fate Reforged (FRF).
//
// Rulings:
//   [2014-11-24] Bolster itself doesn't target any creature, though some spells and abilities that
//     bolster may have other effects that target creatures.
//   [2014-11-24] You determine which creature to put counters on as the spell or ability that
//     instructs you to bolster resolves.
//
// "Defending player" is the player the triggering creature attacks (or the
// controller of the planeswalker it attacks) — the attack trigger's player
// (`whose: "trigger-player"`); this creature needn't be the one attacking.

const BOLSTER_TEXT = "When this creature enters, bolster 2.";
const ATTACK_TEXT =
  "Whenever a creature you control with a +1/+1 counter on it attacks, tap target creature defending player controls.";

export default defineCard({
  name: "Elite Scaleguard",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 3,
  text: `When this creature enters, bolster 2. (Choose a creature with the least toughness among creatures you control and put two +1/+1 counters on it.)\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "bolster", amount: 2 },
      resolve: null,
      text: BOLSTER_TEXT,
    },
    {
      trigger: {
        on: "attacks",
        who: "you-control",
        filter: { type: "creature", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
      },
      targets: [{ kind: "permanent", whose: "trigger-player", filter: { type: "creature" } }],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
