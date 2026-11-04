import { defineCard } from "../define.js";

const FACES = ["Flotsam // Jetsam", "Flotsam", "Jetsam"];
const TEXT =
  "Each opponent mills three cards, then you may cast a spell from each opponent's graveyard without paying its mana cost. If a spell cast this way would be put into a graveyard, exile it instead.";

// The right half of Flotsam // Jetsam. Rulings: you choose whether to cast them
// as Jetsam resolves, as part of its resolution, timing ignored; X is 0; a
// mandatory additional cost must still be paid. The offers run one at a time,
// so the caster sets the order the spells go on the stack in.
export default defineCard({
  name: "Jetsam",
  manaCost: "{4}{U/B}{U/B}",
  colors: ["B", "U"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "mill", target: "each-opponent", amount: 3 },
      {
        kind: "cast-now",
        from: "opponents-graveyards",
        repeat: true,
        onePerGraveyard: true,
        free: true,
        exileAfter: true,
      },
    ],
  },
  faces: FACES,
  split: true,
});
