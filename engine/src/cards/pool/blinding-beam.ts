import { defineCard } from "../define.js";

// The second mode holds every creature during that player's next untap step,
// whoever controls it — one that would untap then through Seedborn Muse too
// (`skip-next-untap`'s `anyController`) — read then, so one that entered
// since is held as well.
export default defineCard({
  name: "Blinding Beam",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  kicker: { cost: "{1}", keyword: "entwine" },
  text: "Choose one —\n• Tap two target creatures.\n• Creatures don't untap during target player's next untap step.\nEntwine {1} (Choose both if you pay the entwine cost.)",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Tap two target creatures.",
        targets: ["creature", "creature"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "tap", target: 0 },
            { kind: "tap", target: 1 },
          ],
        },
      },
      {
        text: "Creatures don't untap during target player's next untap step.",
        targets: ["player"],
        effect: { kind: "skip-next-untap", filter: { type: "creature" }, who: 0, anyController: true },
      },
    ],
    kickedModes: 2,
  },
});
