import { defineCard } from "../define.js";

// EDHREC rank 19972. Modern Horizons 3.
//
// "You may pay {E}. If you do" is a `may` with `costEnergy` (Assaultron
// Dominator), paid as the trigger resolves; the target is chosen as it goes
// on the stack (it isn't a "when you do"), so with no other creature it
// isn't put on the stack, and with its target gone it doesn't resolve and
// no {E} can be paid (the ruling). Living Lightning's pump and haste.
//
// Rulings:
//   [2024-06-07] Some triggered abilities state that you "may pay" a certain amount of {E}. You
//     can't pay that amount multiple times to multiply the effect.
//   [2024-06-07] If a spell or ability with one or more targets states that you "may pay" some
//     amount of {E}, and each permanent that it targets has become an illegal target, the spell or
//     ability won't resolve. You can't pay any {E} even if you want to.

const ENTER_TEXT = "When this creature enters, you get {E}{E} (two energy counters).";
const COMBAT_TEXT =
  "At the beginning of combat on your turn, you may pay {E}. If you do, another target creature you control gets +1/+0 and gains haste until end of turn.";

export default defineCard({
  name: "Conduit Goblin",
  manaCost: "{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 2,
  toughness: 2,
  text: `${ENTER_TEXT}\n${COMBAT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 2 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: {
        kind: "may",
        prompt: "Pay {E} to give the target creature +1/+0 and haste until end of turn?",
        costEnergy: 1,
        effect: {
          kind: "sequence",
          effects: [
            { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
            { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
          ],
        },
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
