import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 24625. Ixalan. Four untargeted choices made as it resolves,
// one type after another (Ghostly Dancers' "return an enchantment card from
// your graveyard to your hand"): with none of a type, it moves on to the next;
// a card of two of the types can be returned for one and another card for the
// other (the rulings).
const returnOne = (subtype: string): EffectSpec => ({
  kind: "look-and-choose",
  zone: "graveyard",
  min: 1,
  max: 1,
  destination: "hand",
  leftover: "stay",
  filter: { subtype },
});

export default defineCard({
  name: "Grim Captain's Call",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Return a Pirate card from your graveyard to your hand, then do the same for Vampire, Dinosaur, and Merfolk.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [returnOne("Pirate"), returnOne("Vampire"), returnOne("Dinosaur"), returnOne("Merfolk")],
  },
});
