import { defineCard } from "../define.js";

// Time Spiral. EDHREC rank 28179.
//
// Benalish Cavalry's flanking, Alaborn Cavalier's attack trigger, and
// Spires of Orazca's "untap … and remove it from combat" behind a may.

const ATTACK_TEXT = "Whenever this creature attacks, you may tap target creature.";
const BLOCKED_TEXT = "Whenever this creature becomes blocked, you may untap this creature and remove it from combat.";

export default defineCard({
  name: "Gustcloak Cavalier",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["flanking"],
  text: `Flanking (Whenever a creature without flanking blocks this creature, the blocking creature gets -1/-1 until end of turn.)\n${ATTACK_TEXT}\n${BLOCKED_TEXT}`,
  triggered: [
    {
      trigger: { on: "blocked-by", who: "self", blocker: { notKeyword: "flanking" } },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "trigger-object",
        power: -1,
        toughness: -1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Flanking",
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature"],
      effect: { kind: "may", prompt: "Tap target creature?", effect: { kind: "tap", target: 0 } },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Untap Gustcloak Cavalier and remove it from combat?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "untap", target: "source" },
            { kind: "remove-from-combat", target: "source" },
          ],
        },
      },
      resolve: null,
      text: BLOCKED_TEXT,
    },
  ],
});
