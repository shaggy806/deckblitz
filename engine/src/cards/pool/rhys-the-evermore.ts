import { defineCard } from "../define.js";
import { persist } from "../helpers.js";

// EDHREC rank 11219.
//
// Rulings:
//   [2008-08-01] If the target creature dies but that card leaves the graveyard before the
//     persist ability resolves, it won't be returned to the battlefield.
//   [2008-08-01] If a creature with persist that has +1/+1 counters on it receives enough -1/-1
//     counters to cause it to be destroyed by lethal damage or put into its owner's graveyard for
//     having 0 or less toughness, persist won't trigger and the card won't return to the
//     battlefield.
//   [2008-08-01] If a creature has +1/+1 counters and -1/-1 counters on it, state-based actions
//     remove the same number of each so that it has only one kind of those counters on it.
//
// "Gains persist" is the `persist()` trigger granted until end of turn
// (Antler Skulkin). "Any number of counters" — of any kinds, how many of each
// the controller's choice as it resolves (`remove-counters`, `count: "any"`).
const ENTER_TEXT =
  "When Rhys enters, another target creature you control gains persist until end of turn. (When it dies, if it had no -1/-1 counters on it, return it to the battlefield under its owner's control with a -1/-1 counter on it.)";
const REMOVE_TEXT = "{W}, {T}: Remove any number of counters from target creature you control. Activate only as a sorcery.";

export default defineCard({
  name: "Rhys, the Evermore",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 2,
  toughness: 2,
  keywords: ["flash"],
  text: `Flash\n${ENTER_TEXT}\n${REMOVE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "grant-triggered", target: 0, ability: persist(), duration: "end-of-turn" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{W}", tap: true },
      targets: ["creature-you-control"],
      effect: { kind: "remove-counters", target: 0, counter: "any", count: "any" },
      sorcerySpeed: true,
      resolve: null,
      text: REMOVE_TEXT,
    },
  ],
});
