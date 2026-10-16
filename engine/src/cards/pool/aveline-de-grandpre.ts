import { defineCard } from "../define.js";

// EDHREC rank 7528.
//
// Rulings:
//   [2024-07-05] If a creature you control with deathtouch deals combat damage to a player at the
//     same time it's dealt lethal damage (perhaps because it has trample and was blocked), it will
//     die before Aveline's triggered ability resolves and puts +1/+1 counters on it.
//   [2024-07-05] The creature spell is a 2/2 creature spell with ward {2} that has no name, mana
//     cost, or creature types. ... Both the spell and the resulting creature are colorless and
//     have a mana value of 0.
// The trigger is White Widow's filter (deathtouch as the damage is dealt) with
// Necropolis Regent's "that many" (the damage dealt); a creature that has died
// meanwhile gets nothing (the ruling). Disguise is Arno Dorian's `morph`.

const TRIGGER_TEXT =
  "Whenever a creature you control with deathtouch deals combat damage to a player, put that many +1/+1 counters on that creature.";

export default defineCard({
  name: "Aveline de Grandpré",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 3,
  toughness: 3,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${TRIGGER_TEXT}\nDisguise {B}{G} (You may cast this card face down for {3} as a 2/2 creature with ward {2}. Turn it face up any time for its disguise cost.)`,
  morph: { keyword: "disguise", cost: "{B}{G}" },
  triggered: [
    {
      trigger: {
        on: "deals-combat-damage-to-player",
        who: "you-control",
        filter: { type: "creature", keyword: "deathtouch" },
      },
      targets: [],
      effect: { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: { triggerValue: true } },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
