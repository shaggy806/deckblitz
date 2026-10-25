import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 26136.
//
// Volcanic Eruption's shape: the X targets destroyed as one event, then each
// player dealt damage equal to the artifacts *they* controlled that went to a
// graveyard (`thisWay: "died"`, `who: "each"` — each entry's player is the
// artifact's controller as it left), so an indestructible or regenerated one
// isn't counted.

export default defineCard({
  name: "Builder's Bane",
  manaCost: "{X}{X}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy X target artifacts. Builder's Bane deals damage to each player equal to the number of artifacts they controlled that were put into a graveyard this way.",
  targets: [{ kind: "any-number", of: "artifact", min: "x", max: "x" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "for-each-target", from: 0, effect: { kind: "destroy", target: 0 }, simultaneous: true },
      { kind: "damage", amount: { thisWay: "died", who: "each" }, who: "each-player" },
    ],
  },
});
