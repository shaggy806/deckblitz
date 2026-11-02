import { defineCard } from "../define.js";

// EDHREC rank 11211. The cost's count is read as it's activated: fewer cards
// as a multiplayer game loses opponents.
const GAINS_TEXT =
  "{T}, Exile cards from your graveyard equal to the number of opponents you have: Target creature card in your graveyard gains encore until end of turn. The encore cost is equal to its mana cost. (Exile the creature card and pay its mana cost: For each opponent, create a token copy that attacks that opponent this turn if able. They gain haste. Sacrifice them at the beginning of the next end step. Activate only as a sorcery.)";

export default defineCard({
  name: "Araumi of the Dead Tide",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Merfolk", "Wizard"],
  power: 1,
  toughness: 4,
  text: GAINS_TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, exileFromGraveyard: { count: "opponents" } },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: { kind: "grant-graveyard-keyword", target: 0, grant: { keyword: "encore" } },
      resolve: null,
      text: GAINS_TEXT,
    },
  ],
});
