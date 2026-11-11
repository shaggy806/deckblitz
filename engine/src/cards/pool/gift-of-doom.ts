import { defineCard } from "../define.js";

// EDHREC rank 6768. Cast face down it's a 2/2 creature spell with no target
// (rule 708.4); turned face up — one other creature sacrificed, chosen while
// it's still face down — it's an Aura on the battlefield attached to nothing,
// and its controller may attach it to a creature it could legally enchant, not
// targeted (the rulings: hexproof doesn't stop it, protection from black
// does). Left unattached, it's put into its owner's graveyard (rule 704.5m).

const GRANT_TEXT = "Enchanted creature has deathtouch and indestructible.";
const MORPH_TEXT =
  "Morph—Sacrifice another creature. (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)";
const FACE_UP_TEXT = "As this Aura is turned face up, you may attach it to a creature.";

export default defineCard({
  name: "Gift of Doom",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${GRANT_TEXT}\n${MORPH_TEXT}\n${FACE_UP_TEXT}`,
  targets: ["creature"],
  morph: {
    keyword: "morph",
    cost: "",
    also: { sacrifice: { filter: { type: "creature" }, count: 1 } },
    text: "Sacrifice another creature",
  },
  asTurnedFaceUp: {
    effect: {
      kind: "attach",
      attachment: "source",
      target: { among: { type: "creature" }, prompt: "You may attach Gift of Doom to a creature", optional: true },
    },
  },
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["deathtouch", "indestructible"],
      text: GRANT_TEXT,
    },
  ],
});
