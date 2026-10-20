import { defineCard } from "../define.js";

// The token copies the target's copiable values (rule 707.2); its controller
// chooses which player or planeswalker it attacks (the ruling — `"choose"`).
// Whether the target is a Kraken, Leviathan, Octopus, or Serpent is read as
// the ability resolves.
const ATTACK_TEXT =
  "Whenever Krothuss attacks, create a tapped and attacking token that's a copy of another target attacking creature. If that creature is a Kraken, Leviathan, Octopus, or Serpent, create two of those tokens instead.";

export default defineCard({
  name: "Krothuss, Lord of the Deep",
  art: "https://cards.scryfall.io/art_crop/back/f/6/f6c0fca5-b759-4543-95e2-8d712aae5281.jpg",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Kraken", "Horror"],
  power: 3,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "other", of: { kind: "permanent", filter: { type: "creature", attacking: true } } }],
      effect: {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { subtypes: ["Kraken", "Leviathan", "Octopus", "Serpent"] } },
        then: { kind: "create-token-copy", of: 0, count: 2, who: "you", tapped: true, attacking: "choose" },
        else: { kind: "create-token-copy", of: 0, count: 1, who: "you", tapped: true, attacking: "choose" },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  faces: ["Runo Stromkirk", "Krothuss, Lord of the Deep"],
  transform: true,
});
