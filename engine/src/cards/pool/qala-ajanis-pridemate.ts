import { defineCard } from "../define.js";

// EDHREC rank 7396.
//
// Rulings:
//   [2024-11-08] In a Two-Headed Giant game, life gained by your teammate won't cause Qala's
//     second ability to trigger, even though it caused your team's life total to increase.
//   [2024-11-08] Qala's second ability triggers just once for each life-gaining event, whether
//     it's 1 life from Dazzling Angel or 4 life from Apothecary Stomper.
//   [2024-11-08] The value of X is calculated only once, as Qala's first ability resolves.
//   [2024-11-08] If you gain an amount of life "for each" of something or "equal to the number" of
//     something, that life is gained as one event and Qala's second ability triggers only once.
//   [2024-11-08] If Qala is dealt lethal damage at the same time that you gain life, it won't
//     receive a counter from its second ability in time to save it.
//   [2024-11-08] Each creature with lifelink dealing combat damage causes a separate life-gaining
//     event. For example, if two creatures you control with lifelink deal combat damage at the
//     same time, Qala's second ability will trigger twice. However, if a single creature you
//     control with lifelink deals combat damage to multiple creatures, players, planeswalkers,
//     and/or battles at the same time (perhaps because it has trample or was blocked by more than
//     one creature), the ability will trigger only once.

// X counts every kind of counter on Qala, read once as the attack trigger
// resolves (the ruling) — Firebird, Blazing Ranger's shape.
export default defineCard({
  name: "Qala, Ajani's Pridemate",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Cat", "Warrior"],
  power: 3,
  toughness: 3,
  text: "Whenever Qala attacks, other attacking creatures you control get +X/+0 until end of turn, where X is the number of counters on Qala.\nWhenever you gain life, put a +1/+1 counter on Qala.\n{3}{W}: You gain 1 life.",
  activated: [
    {
      cost: { mana: "{3}{W}", tap: false },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: "{3}{W}: You gain 1 life.",
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", attacking: true, controlledBy: "you" },
        power: { countersOn: "source" },
        toughness: 0,
        duration: "end-of-turn",
        exceptSource: true,
      },
      resolve: null,
      text: "Whenever Qala attacks, other attacking creatures you control get +X/+0 until end of turn, where X is the number of counters on Qala.",
    },
    {
      trigger: { on: "gains-life", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever you gain life, put a +1/+1 counter on Qala.",
    },
  ],
});
