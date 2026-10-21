import { defineCard } from "../define.js";

// With the target illegal as it resolves the whole spell does nothing, so
// nothing is looked at (the ruling).
export default defineCard({
  name: "Ajani's Influence",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Put two +1/+1 counters on target creature.\nLook at the top five cards of your library. You may reveal a white card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      {
        kind: "look-and-choose",
        zone: "library",
        count: 5,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { colors: ["W"] },
        destination: "hand",
        leftover: "bottom-random",
      },
    ],
  },
});
