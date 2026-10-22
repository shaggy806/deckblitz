import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 31678.
//
// By Force's shape: exactly X targets, destroyed together.

export default defineCard({
  name: "Avalanche",
  manaCost: "{X}{2}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy X target snow lands.",
  targets: [
    { kind: "any-number", of: { kind: "permanent", filter: { type: "land", supertype: "snow" } }, min: "x", max: "x" },
  ],
  effect: { kind: "for-each-target", from: 0, effect: { kind: "destroy", target: 0 }, simultaneous: true },
});
