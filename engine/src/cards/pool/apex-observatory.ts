import { CARD_TYPE_CHOICES } from "../../effects.js";
import { defineCard } from "../define.js";

// Rulings:
//   The back faces of some cards with craft refer to cards "used to craft" it. This refers to the
//     cards exiled as part of the cost of the craft ability of the front face. Those cards are
//     considered to be "used to craft" that permanent as long as they remain exiled and the
//     permanent remains on the battlefield.
//   Card types that may appear in a normal game of Magic are artifact, battle, creature,
//     enchantment, instant, kindred, land, planeswalker, and sorcery. Supertypes and subtypes may
//     not be chosen. Land may be chosen, but it's not a good idea.
//
// The choice is offered only over the card types two or more of the exiled
// materials share (`chooseOnEnterSharedByExiled`); with a token among them
// nothing is in exile to share one, so nothing is chosen and the {T} ability
// reaches no spell. The type is read as the ability resolves and fixed from
// then on (`grant-spells-this-turn` fixes `ofChosenCardType`, rule 608.2h);
// the next spell of that type cast this turn uses the grant up however it's
// cast (601.2i), and "without paying its mana cost" is an alternative cost
// of {0} (118.9).

const ENTER_TEXT =
  "This artifact enters tapped. As it enters, choose a card type shared among two exiled cards used to craft it.";
const FREE_TEXT =
  "{T}: The next spell you cast this turn of the chosen type can be cast without paying its mana cost.";

export default defineCard({
  name: "Apex Observatory",
  art: "https://cards.scryfall.io/art_crop/back/1/5/15304957-dbb5-4010-a0a6-27343d4c20a3.jpg",
  colors: [],
  types: ["artifact"],
  text: `${ENTER_TEXT}\n${FREE_TEXT}`,
  chooseOnEnter: CARD_TYPE_CHOICES,
  chooseOnEnterSharedByExiled: true,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This artifact enters tapped.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "grant-spells-this-turn", next: true, free: true, filter: { ofChosenCardType: true } },
      resolve: null,
      text: FREE_TEXT,
    },
  ],
  faces: ["Eye of Ojer Taq", "Apex Observatory"],
  transform: true,
});
