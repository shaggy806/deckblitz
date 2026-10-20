import { defineCard } from "../define.js";
import { ninjutsu, ninjutsuText } from "../helpers.js";

// Kamigawa: Neon Dynasty (NEO). EDHREC rank 19201.
//
// Rulings:
//   [2022-02-18] The target of Coiling Stalker's triggered ability will become an illegal target
//     if a +1/+1 counter is placed on it before the triggered ability resolves.
//
// "Doesn't have a +1/+1 counter on it" is part of the target's filter, so it's checked again
// as the trigger resolves (the ruling).
const DAMAGE_TEXT =
  "Whenever this creature deals combat damage to a player, put a +1/+1 counter on target creature you control that doesn't have a +1/+1 counter on it.";

export default defineCard({
  name: "Coiling Stalker",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Snake", "Ninja"],
  power: 2,
  toughness: 1,
  text: `${ninjutsuText("{1}{G}")}\n${DAMAGE_TEXT}`,
  activated: [ninjutsu("{1}{G}")],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [
        {
          kind: "permanent",
          whose: "you",
          filter: { type: "creature", counters: { kind: "+1/+1", compare: { op: "lte", n: 0 } } },
        },
      ],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
