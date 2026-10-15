import type { CardFilter } from "../../filter.js";
import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

// EDHREC rank 18419.
//
// Reconstruct History's shape: four instances of the word "target", each its
// own optional slot, so one card may be chosen for more than one of them
// (rule 115.3 — a vanilla creature card as both "creature card" and "creature
// card with no abilities"); no slot is `other` than another. They return
// together.

const upToOne = (filter: CardFilter): TargetSpec => ({
  kind: "optional",
  of: { kind: "card-in-graveyard", whose: "you", filter },
});

export default defineCard({
  name: "Rise from the Wreck",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Return up to one target creature card, up to one target Mount card, up to one target Vehicle card, and up to one target creature card with no abilities from your graveyard to your hand.",
  targets: [
    upToOne({ type: "creature" }),
    upToOne({ subtype: "Mount" }),
    upToOne({ subtype: "Vehicle" }),
    upToOne({ type: "creature", hasAbilities: false }),
  ],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "return-to-hand", target: 0, from: "graveyard" },
      { kind: "return-to-hand", target: 1, from: "graveyard" },
      { kind: "return-to-hand", target: 2, from: "graveyard" },
      { kind: "return-to-hand", target: 3, from: "graveyard" },
    ],
  },
});
