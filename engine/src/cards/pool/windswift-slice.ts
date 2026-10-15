import { defineCard } from "../define.js";

// EDHREC rank 3900. A one-sided fight; the excess is past lethal damage for
// the creature dealt it (rule 120.4a), 1 from a deathtouch creature.

export default defineCard({
  name: "Windswift Slice",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature you control deals damage equal to its power to target creature you don't control. Create a number of 1/1 green Elf Warrior creature tokens equal to the amount of excess damage dealt this way.",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "fight", a: 0, b: 1, oneSided: true },
      { kind: "create-token", token: "Elf Warrior Token", count: { excessDamageThisWay: true } },
    ],
  },
});
