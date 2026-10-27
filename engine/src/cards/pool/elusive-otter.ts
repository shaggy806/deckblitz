import { defineCard } from "../define.js";

// Its power is compared with a would-be blocker's only as blockers are
// declared (the ruling) — the static is asked then.

const PROWESS_TEXT = "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)";
const EVASION_TEXT = "Creatures with power less than this creature's power can't block it.";

export default defineCard({
  name: "Elusive Otter",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Otter"],
  power: 1,
  toughness: 1,
  text: `${PROWESS_TEXT}\n${EVASION_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PROWESS_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { power: { op: "lt", n: { amount: { powerOf: "source" } } } },
      text: EVASION_TEXT,
    },
  ],
  faces: ["Elusive Otter", "Grove's Bounty"],
  adventure: true,
});
