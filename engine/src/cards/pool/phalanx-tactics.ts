import { defineCard } from "../define.js";

// "+2/+1 to the target, +1/+1 to each other creature you control" is +1/+0
// to the target and +1/+1 to every creature you control: the target is a
// creature you control whenever the spell resolves (one gone illegal and the
// spell doesn't resolve at all — the ruling), so each creature ends with
// exactly what the card gives it. (`modify-pt-all` has no `exceptTarget`.)
export default defineCard({
  name: "Phalanx Tactics",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature you control gets +2/+1 until end of turn. Each other creature you control gets +1/+1 until end of turn.",
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
    ],
  },
});
