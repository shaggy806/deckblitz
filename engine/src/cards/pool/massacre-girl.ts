import { defineCard } from "../define.js";

// EDHREC rank 1752. The "whenever a creature dies this turn" ability is a
// delayed triggered ability made as the enters ability resolves (rule
// 603.7c), so it works whether or not Massacre Girl stays (the rulings); it
// triggers once per creature that dies, several at once included, and each
// -1/-1 reaches only the creatures there as it resolves. A creature the first
// -1/-1 leaves at 0 toughness dies after the delayed ability exists, so it
// triggers it (the ruling — state-based actions wait for the resolution).
const TEXT =
  "When Massacre Girl enters, each other creature gets -1/-1 until end of turn. Whenever a creature dies this turn, each creature other than Massacre Girl gets -1/-1 until end of turn.";
const SHRINK = {
  kind: "modify-pt-all",
  filter: { type: "creature" },
  power: -1,
  toughness: -1,
  duration: "end-of-turn",
  exceptSource: true,
} as const;

export default defineCard({
  name: "Massacre Girl",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 4,
  toughness: 4,
  keywords: ["menace"],
  text: `Menace\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          SHRINK,
          {
            kind: "delayed-trigger",
            at: { whenever: { on: "dies", who: "any", filter: { type: "creature" } } },
            effect: SHRINK,
            text: "Whenever a creature dies this turn, each creature other than Massacre Girl gets -1/-1 until end of turn.",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
