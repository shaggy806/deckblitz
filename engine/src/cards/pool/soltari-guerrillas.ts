import { defineCard } from "../define.js";

// EDHREC rank 25018.
//
// A one-shot redirection (rule 614.9): whichever opponent it would next deal
// combat damage to this turn — asked as that damage would be dealt, not as
// it's activated (the ruling) — that damage goes to the target creature.

const TEXT =
  "{0}: The next time this creature would deal combat damage to an opponent this turn, it deals that damage to target creature instead.";

export default defineCard({
  name: "Soltari Guerrillas",
  manaCost: "{2}{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Soltari", "Soldier"],
  power: 3,
  toughness: 2,
  keywords: ["shadow"],
  text: `Shadow (This creature can block or be blocked by only creatures with shadow.)\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{0}", tap: false },
      targets: ["creature"],
      effect: {
        kind: "damage-rule",
        to: { players: "opponents" },
        by: { target: "source" },
        combat: true,
        amount: "next-time",
        redirectTo: 0,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
