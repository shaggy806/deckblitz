import { defineCard } from "../define.js";

// Apocalypse (APC). Kicked, the kicker's effect replaces the spell's: the
// same +1/+1 to every creature you control, and +2/+2 more to your Zombies.
const ALL = {
  kind: "modify-pt-all",
  filter: { type: "creature", controlledBy: "you" },
  power: 1,
  toughness: 1,
  duration: "end-of-turn",
} as const;

export default defineCard({
  name: "Strength of Night",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Kicker {B} (You may pay an additional {B} as you cast this spell.)\nCreatures you control get +1/+1 until end of turn. If this spell was kicked, Zombie creatures you control get an additional +2/+2 until end of turn.",
  targets: [],
  effect: ALL,
  kicker: {
    cost: "{B}",
    effect: {
      kind: "sequence",
      effects: [
        ALL,
        {
          kind: "modify-pt-all",
          filter: { type: "creature", subtype: "Zombie", controlledBy: "you" },
          power: 2,
          toughness: 2,
          duration: "end-of-turn",
        },
      ],
    },
  },
});
