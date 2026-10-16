import { defineCard } from "../define.js";

// "Creatures that don't have a name": a face-down creature (rule 708.2a), a
// copy of one — its copiable values are the face-down 2/2's (rule 707.2) —
// and a Room with both doors locked that has become a creature (rule 709.5).
// The engine names each of these by an internal registry key standing for "no
// name" (`FACE_DOWN_CARDS`, `LOCKED_ROOM` in state.ts), which is what `name`
// reads for them, so these three keys are exactly the nameless objects. Once
// blocked, losing its name doesn't remove a blocker (the ruling): the
// restriction is checked only as blockers are declared.

const HEXPROOF_TEXT = "During your turn, this creature has hexproof.";
const BLOCK_TEXT = "This creature can't be blocked by creatures that don't have a name.";

export default defineCard({
  name: "Pompous Gadabout",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Citizen"],
  power: 4,
  toughness: 2,
  text: `${HEXPROOF_TEXT}\n${BLOCK_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      grantKeywords: ["hexproof"],
      text: HEXPROOF_TEXT,
    },
    {
      affects: { scope: "self" },
      cantBeBlockedBy: {
        anyOf: [
          { name: "Face-Down Creature" },
          { name: "Face-Down Creature (Ward {2})" },
          { name: "Room (Both Doors Locked)" },
        ],
      },
      text: BLOCK_TEXT,
    },
  ],
});
