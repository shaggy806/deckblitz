import { defineCard } from "../define.js";

// EDHREC rank 16682.
//
// "Another target Elf you control" is any other Elf permanent you control (a
// kindred one too) — Foot Elite's shape over an Elf filter.
const ATTACK_TEXT = "Whenever this creature attacks, another target Elf you control gets +2/+1 until end of turn.";

export default defineCard({
  name: "Vinebred Brawler",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Berserker"],
  power: 4,
  toughness: 2,
  text: `This creature must be blocked if able.\n${ATTACK_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["must-be-blocked-if-able"],
      text: "This creature must be blocked if able.",
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "other", of: { kind: "permanent", whose: "you", filter: { subtype: "Elf" } } }],
      effect: { kind: "modify-pt", target: 0, power: 2, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
