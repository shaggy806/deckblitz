import { defineCard } from "../define.js";
import { embalmAbility } from "../helpers.js";

// EDHREC rank 4355. Clone, and embalm (rule 702.128a). The embalm token is a
// copy of the Vizier card, so it too may enter as a copy of a creature — and
// then what it copies replaces embalm's own exceptions, which is why the card
// restates them: only for a token an embalm ability made
// (`exceptIfEmbalmed`), they're copiable values of what it becomes. Cast from
// hand it's a plain Clone.
//
// Rulings:
//   - The characteristics Vizier of Many Faces gains as part of its copy effect are copiable
//     values that other effects may copy.
//   - Any enters-the-battlefield abilities of the copied creature will trigger when Vizier of Many
//     Faces enters the battlefield. Any "as [this creature] enters the battlefield" or "[this
//     creature] enters the battlefield with" abilities of the chosen creature will also work.
//   - The token copies exactly what was printed on the original card and nothing else. It doesn't
//     copy any information about the object the card was before it was put into your graveyard.
//   - If the chosen creature has {X} in its mana cost, X is considered to be 0.
//   - If the chosen creature is copying something else (for example, if the chosen creature is
//     another Vizier of Many Faces), then Vizier of Many Faces enters the battlefield as whatever
//     the chosen creature copied.
//   - If the chosen creature is a token, Vizier of Many Faces copies the original characteristics
//     of that token as stated by the effect that created the token. Vizier of Many Faces is not a
//     token in this case unless it's embalmed.
//   - The token is a Zombie in addition to its other types and is white instead of its other
//     colors. It has no mana cost, and thus its mana value is 0. These are copiable values of the
//     token that other effects may copy.
//   - If Vizier of Many Faces somehow enters the battlefield at the same time as another
//     creature, Vizier of Many Faces can't become a copy of that creature. You may choose only a
//     creature that's already on the battlefield.
//   - Once you've activated an embalm ability, the card is immediately exiled. Opponents can't try
//     to stop the ability by exiling the card with an effect such as that of Crook of
//     Condemnation.

const COPY_TEXT =
  "You may have this creature enter as a copy of any creature on the battlefield, except if this creature was embalmed, the token has no mana cost, it's white, and it's a Zombie in addition to its other types.";
const EMBALM_TEXT =
  "Embalm {3}{U}{U} ({3}{U}{U}, Exile this card from your graveyard: Create a token that's a copy of it, except it's a white Zombie Shapeshifter Cleric with no mana cost. Embalm only as a sorcery.)";

export default defineCard({
  name: "Vizier of Many Faces",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Shapeshifter", "Cleric"],
  power: 0,
  toughness: 0,
  text: `${COPY_TEXT}\n${EMBALM_TEXT}`,
  copyOnEnter: {
    filter: { type: "creature" },
    exceptIfEmbalmed: { setColors: ["W"], addSubtypes: ["Zombie"], noManaCost: true },
  },
  activated: [embalmAbility("{3}{U}{U}", EMBALM_TEXT)],
});
