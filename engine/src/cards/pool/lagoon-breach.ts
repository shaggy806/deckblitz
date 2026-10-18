import { defineCard } from "../define.js";

// The Adventure of Horned Loch-Whale. "You don't control" is an opponent's —
// every other player is an opponent. Misleading Motes's owner's choice of top
// or bottom: a stolen attacker's owner chooses, not its controller.

export default defineCard({
  name: "Lagoon Breach",
  art: "https://cards.scryfall.io/art_crop/back/9/6/96a05063-0556-42e4-8d4c-8e92be160ef5.jpg",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  subtypes: ["Adventure"],
  text: "The owner of target attacking creature you don't control puts it on their choice of the top or bottom of their library. (Then exile this card. You may cast the creature later from exile.)",
  targets: [{ kind: "permanent", whose: "opponent", filter: { type: "creature", attacking: true } }],
  effect: { kind: "put-on-library", target: 0, position: { ownerChooses: ["top", "bottom"] } },
  faces: ["Horned Loch-Whale", "Lagoon Breach"],
  adventure: true,
});
