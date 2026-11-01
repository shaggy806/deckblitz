import { defineCard } from "../define.js";

// The same test as Tsabo's Assassin, on a spell: this spell is on the stack, so it
// isn't one of the permanents counted (`most-common-color`'s `sharedBy: { target: 0 }`).

export default defineCard({
  name: "Barrin's Unmaking",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return target permanent to its owner's hand if that permanent shares a color with the most common color among all permanents or a color tied for most common.",
  targets: ["permanent"],
  effect: {
    kind: "conditional",
    condition: { kind: "most-common-color", sharedBy: { target: 0 } },
    then: { kind: "return-to-hand", target: 0 },
  },
});
