import { defineCard } from "../define.js";

// Cheeky House-Mouse's Adventure. "Can't be blocked by … this turn" is a rule
// on the creature checked as blockers are declared, so a later power change
// doesn't undo a block (the ruling).

export default defineCard({
  name: "Squeak By",
  art: "https://cards.scryfall.io/art_crop/back/1/f/1f3013bf-9647-4bdb-a638-d299ae00f88e.jpg",
  manaCost: "{W}",
  colors: ["W"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Target creature you control gets +1/+1 until end of turn. It can't be blocked by creatures with power 3 or greater this turn.",
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      { kind: "restrict", target: 0, restrictions: [], cantBeBlockedBy: { power: { op: "gte", n: 3 } } },
    ],
  },
  faces: ["Cheeky House-Mouse", "Squeak By"],
  adventure: true,
});
