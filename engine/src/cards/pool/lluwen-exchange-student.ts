import { defineCard } from "../define.js";
import { entersPrepared, PREPARED_REMINDER } from "../helpers.js";

// EDHREC rank 10150.
// Makes Pest → "Pest Token (Attacks)" (the attack-lifegain Pest; tokens/pest-token-attacks.ts).
//
// Rulings:
//   [2026-03-20] Only the current controller of a prepared creature can cast the copy of its
//     prepare spell in exile. It doesn't matter who owns that creature or who controlled it when
//     it became prepared.
//   [2026-03-20] Creating a copy of a creature's prepare spell in exile ignores copy exceptions
//     applied to that creature that would affect the copiable values of that spell. For example,
//     say a player casts Croaking Counterpart (a sorcery that says "Create a token that's a copy
//     of target non-Frog creature, except it's a 1/1 green Frog.") targeting Goblin Glasswright.
//     The token copy of Goblin Glasswright will enter prepared as a 1/1 green Frog creature, but
//     the copy of Craft with Pride in exile will still be a red sorcery. The copy of Craft with
//     Pride won't be green, a creature, or a Frog, and it won't have power or toughness.
//   [2026-03-20] Preparation cards can only be cast with their base characteristics.
//   [2026-03-20] A preparation card is a creature card in every zone. For example, while it's in
//     your graveyard, Emeritus of Ideation is a blue creature whose mana value is 5. It can't be
//     the target of Zealous Lorecaster's triggered ability ("When this creature enters, return
//     target instant or sorcery card from your graveyard to your hand.").
//   [2026-03-20] Being prepared isn't a copiable value. If a permanent becomes a copy of a
//     prepared creature, it won't be prepared. That permanent will have the alternative
//     characteristics, though, and some other effect could cause it to become prepared later.
//   [2026-03-20] A creature without a prepare spell can't become prepared.
//   [2026-03-20] If an effect instructs you to choose a card name, you may choose the alternative
//     prepare spell's name. Consider only the alternative characteristics to determine whether
//     that is an appropriate name to choose.
//   [2026-03-20] As an effect causes a creature with a prepare spell to become prepared (including
//     effects that state that a creature "enters prepared"), that creature's controller creates a
//     copy of that creature's prepare spell in exile. That copy remains in exile for as long as
//     that permanent is on the battlefield and is prepared. That creature's controller may cast
//     that copy as long as it remains in exile. As they cast it, that creature stops being
//     prepared.
//   [2026-03-20] If a prepared creature loses all abilities, it won't stop being prepared, and
//     nothing will happen to its alternative characteristics or to the copy of its prepare spell
//     in exile.
//   [2026-03-20] If an effect causes a creature to become unprepared, a prepared creature stops
//     being prepared and the associated copy of its prepare spell in exile ceases to exist. If it
//     wasn't prepared at that time, nothing happens.
//   [2026-03-20] If a prepare spell with one or more targets has no legal targets when it tries to
//     resolve, it won't resolve and none of its effects will happen. Since the spell was cast, the
//     associated permanent will still not be prepared.
//   [2026-03-20] If a prepared creature stops being a creature, it will still be prepared, and the
//     copy of its prepare spell will remain in exile. That permanent's controller will still be
//     able to cast it. The same is true if a prepared creature becomes a copy of something else,
//     even if it's then a permanent without a prepare spell.
//   [2026-03-20] While copies of spells in zones other than the stack cease to exist when
//     state-based actions are checked, this does not apply to copies of prepare spells in exile
//     that were created as a creature became prepared.
//   [2026-03-20] A creature with a prepare spell can't become prepared more than once at the same
//     time. For example, Emeritus of Ideation is on the battlefield and is prepared. When it
//     attacks, its last ability triggers. When that ability resolves, its controller may still
//     exile eight cards from their graveyard, but doing so won't cause Emeritus of Ideation to
//     become prepared a second time or create a second copy of Ancestral Recall in exile.
//   [2026-03-20] Casting a copy of a prepare spell from exile isn't casting it for an alternative
//     cost. Effects that allow you to cast a spell for an alternative cost or without paying its
//     mana cost may allow you to apply those to a copy of a prepare spell cast from exile.

const ENTERS_TEXT = `Lluwen enters prepared. ${PREPARED_REMINDER}`;
const PREPARE_TEXT = "Exile a creature card from your graveyard: Lluwen becomes prepared. Activate only as a sorcery.";

// Pest Friend is its own `prepareSpellOnly` file. The cost can be paid while
// Lluwen is already prepared; it just doesn't prepare it twice (the ruling).
export default defineCard({
  name: "Lluwen, Exchange Student",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 3,
  toughness: 4,
  prepareSpell: "Pest Friend",
  text: `${ENTERS_TEXT}\n${PREPARE_TEXT}`,
  static: [entersPrepared(ENTERS_TEXT)],
  activated: [
    {
      cost: { mana: null, tap: false, exileFromGraveyard: { count: 1, filter: { type: "creature" } } },
      targets: [],
      effect: { kind: "become-prepared", target: "source" },
      sorcerySpeed: true,
      resolve: null,
      text: PREPARE_TEXT,
    },
  ],
});
