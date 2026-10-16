import { defineCard } from "../define.js";

// EDHREC rank 14316. Bionic Blow's "up to one other target creature" slot.
export default defineCard({
  name: "Mabel's Mettle",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature gets +2/+2 until end of turn. Up to one other target creature gets +1/+1 until end of turn.",
  targets: ["creature", { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      { kind: "modify-pt", target: 1, power: 1, toughness: 1, duration: "end-of-turn" },
    ],
  },
});
