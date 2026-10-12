import { defineCard } from "../define.js";

// EDHREC rank 7218.
// Makes Ally → use "Ally Token".
//
// Rulings:
//   [2025-10-02] Although the Ally token created by the triggered ability is attacking, it was
//     never declared as an attacking creature (for the purposes of abilities that trigger whenever
//     a creature attacks, for example).
//   [2025-10-02] You choose which opponent, planeswalker, or battle the token is attacking as it
//     enters.
//   [2025-10-02] The ability that defines Suki, Kyoshi Warrior's power works in all zones, not
//     just the battlefield. As long as Suki is on the battlefield (and still a creature), that
//     ability will count Suki herself.

export default defineCard({
  name: "Suki, Kyoshi Warrior",
  manaCost: "{2}{G/W}{G/W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Ally"],
  power: 0,
  toughness: 4,
  text: "Suki's power is equal to the number of creatures you control.\nWhenever Suki attacks, create a 1/1 white Ally creature token that's tapped and attacking.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      // Attacking a player, planeswalker or battle its controller chooses as
      // it enters; it was never declared as an attacker (the rulings).
      effect: { kind: "create-token", token: "Ally Token", count: 1, tapped: true, attacking: "choose" },
      resolve: null,
      text: "Whenever Suki attacks, create a 1/1 white Ally creature token that's tapped and attacking.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { type: "creature", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
        only: "power",
      },
      text: "Suki's power is equal to the number of creatures you control.",
    },
  ],
});
