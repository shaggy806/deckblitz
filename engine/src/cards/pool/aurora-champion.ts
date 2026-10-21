import { defineCard } from "../define.js";

// Battlebond. EDHREC rank 27488.
//
// "Your team" is "you" outside a team game (rule 102.4); the intervening-if
// (rule 603.4) is checked as the attack triggers and again as it resolves.

const TEXT = "Whenever this creature attacks, if your team controls another Warrior, tap target creature.";

export default defineCard({
  name: "Aurora Champion",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "controls", filter: { subtype: "Warrior" }, atLeast: 1, excludeSelf: true },
      targets: ["creature"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
