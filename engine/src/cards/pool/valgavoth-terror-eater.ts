import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// Duskmourn: House of Horror (DSK).
//
// Rulings:
//   You follow all timing rules for spells cast and lands played using the permission granted by
//     Valgavoth's last ability.
//   The spells you cast this way have an alternative cost that's paying life equal to their mana
//     value. You can't choose to pay their mana cost and may not pay any other alternative costs.
//     You may still pay for additional costs, such as kicker costs, and you may pay mana for those
//     as normal. If the spell has mandatory additional costs, you must pay those.
//
// "A card you didn't control": a card in a hand, a library or a graveyard has no controller, and
// its owner is used (rule 108.4a), so an opponent's discarded or milled card is caught; a
// permanent or spell of an opponent's you control goes to its owner's graveyard. A token isn't a
// card. The card is exiled *with* Valgavoth (rule 607.2b — the replacement's `linked`), so the
// last ability reaches it, and only while this Valgavoth stays (rule 400.7).
const WARD = ward({ sacrifice: { filter: { notTypes: ["land"] }, count: 3, text: "Sacrifice three nonland permanents" } });
const REPLACE_TEXT = "If a card you didn't control would be put into an opponent's graveyard from anywhere, exile it instead.";
const PLAY_TEXT =
  "During your turn, you may play cards exiled with Valgavoth. If you cast a spell this way, pay life equal to its mana value rather than pay its mana cost.";

export default defineCard({
  name: "Valgavoth, Terror Eater",
  manaCost: "{6}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Elder", "Demon"],
  power: 9,
  toughness: 9,
  keywords: ["flying", "lifelink"],
  text: `Flying, lifelink\n${WARD.text}\n${REPLACE_TEXT}\n${PLAY_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-be-put-into-graveyard",
        instead: "exile",
        filter: { ownedBy: "opponent", controlledBy: "opponent", token: false },
        linked: true,
      },
      text: REPLACE_TEXT,
    },
    {
      affects: { scope: "self" },
      playFromExile: { filter: {}, linked: true, yourTurnOnly: true, payLifeManaValue: true },
      text: PLAY_TEXT,
    },
  ],
  triggered: [WARD],
});
