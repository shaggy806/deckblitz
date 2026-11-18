import { defineCard } from "../define.js";

// EDHREC rank 16874.
//
// Rulings:
//   [2023-02-04] You must still follow any timing restrictions and permissions, including those
//     based on the card's type. For instance, you can cast a sorcery using flashback only when you
//     could normally cast a sorcery.
//   [2023-02-04] A spell cast using flashback will always be exiled afterward, whether it
//     resolves, is countered, or leaves the stack in some other way.
//
// Corrupted: a flashback that exists only while an opponent has three or more
// poison counters (`flashback.if`), and only in its owner's graveyard — so
// it's "a card with flashback" nowhere else.
const TOKEN_TEXT = "Create a 3/3 green Phyrexian Beast creature token with toxic 1.";
const FLASHBACK_TEXT =
  "Corrupted — As long as an opponent has three or more poison counters and this card is in your graveyard, it has flashback {2}{G}.";

export default defineCard({
  name: "Viral Spawning",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: `${TOKEN_TEXT} (Players dealt combat damage by it also get a poison counter.)\n${FLASHBACK_TEXT} (You may cast this card from your graveyard for its flashback cost. Then exile it.)`,
  targets: [],
  effect: { kind: "create-token", token: "Phyrexian Beast Token", count: 1 },
  flashback: { cost: "{2}{G}", if: { kind: "player-counters", counter: "poison", who: "opponent", atLeast: 3 } },
});
