import { defineCard } from "../define.js";

// Any number of artifact cards, each from the graveyard of the player chosen
// for slot 0 (`sameController: { slot: 0 }`), all put on top of that player's
// library at once. "In any order" is rule 401.4's: the owner of the cards —
// that player — arranges them (`put-on-libraries` asks each owner).

export default defineCard({
  name: "Drafna's Restoration",
  manaCost: "{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Put any number of target artifact cards from target player's graveyard on top of their library in any order.",
  targets: [
    "player",
    { kind: "any-number", of: { kind: "card-in-graveyard", filter: { type: "artifact" } }, sameController: { slot: 0 } },
  ],
  effect: { kind: "put-on-libraries", what: { targetsFrom: 1 }, position: "top" },
});
