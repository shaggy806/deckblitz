import { defineCard } from "../define.js";

// The division of X is chosen as it's cast, at least one counter to each
// target, so it takes at most X targets; a target gone illegal loses its
// share (the rulings).

export default defineCard({
  name: "Grove's Bounty",
  art: "https://cards.scryfall.io/art_crop/back/b/d/bdb79d68-c3af-4091-b7db-005247191da8.jpg",
  manaCost: "{X}{G}",
  colors: ["G"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Distribute X +1/+1 counters among any number of target creatures you control. (Then exile this card. You may cast the creature later from exile.)",
  targets: [{ kind: "any-number", of: "creature-you-control", min: 0, max: "x" }],
  divided: { total: 0, slot: 0, x: true, of: "+1/+1 counters" },
  effect: { kind: "counters-divided", from: 0, counter: "+1/+1" },
  faces: ["Elusive Otter", "Grove's Bounty"],
  adventure: true,
});
