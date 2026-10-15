import { defineCard } from "../define.js";

// EDHREC rank 15915. "One or two target creatures" is Scrollboost's pair of
// slots, the second optional and another creature.
export default defineCard({
  name: "Fancy Footwork",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  subtypes: ["Lesson"],
  text: "Untap one or two target creatures. They each get +2/+2 until end of turn.",
  targets: ["creature", { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "untap", target: 0 },
      { kind: "untap", target: 1 },
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      { kind: "modify-pt", target: 1, power: 2, toughness: 2, duration: "end-of-turn" },
    ],
  },
});
