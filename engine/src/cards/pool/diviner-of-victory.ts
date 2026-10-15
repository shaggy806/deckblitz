import { defineCard } from "../define.js";

// EDHREC rank 17703.
//
// Rulings:
//   [2026-08-21] If a prepared creature stops being a creature, it will still be prepared, and the
//     copy of its prepare spell will remain in exile. That permanent's controller will still be
//     able to cast it. The same is true if a prepared creature becomes a copy of something else,
//     even if it's then a permanent without a prepare spell.
//   [2026-08-21] Casting a copy of a prepare spell from exile isn't casting it for an alternative
//     cost. Effects that allow you to cast a spell for an alternative cost or without paying its
//     mana cost may allow you to apply those to a copy of a prepare spell cast from exile.
//   [2026-08-21] Creating a copy of a creature's prepare spell in exile ignores copy exceptions
//     applied to that creature that would affect the copiable values of that spell. For example,
//     say a player casts Croaking Counterpart (a sorcery that says "Create a token that's a copy
//     of target non-Frog creature, except it's a 1/1 green Frog") targeting Diviner of Victory.
//     The token copy of Diviner of Victory will enter prepared as a 1/1 green Frog creature, but
//     the copy of Unwind History in exile will still be a blue sorcery. The copy of Unwind History
//     won't be green, a creature, or a Frog, and it won't have power or toughness.
//   [2026-08-21] While copies of spells in zones other than the stack cease to exist when
//     state-based actions are checked, this does not apply to copies of prepare spells in exile
//     that were created as a creature became prepared.
//   [2026-08-21] A preparation card is a creature card in every zone. For example, while it's in
//     your graveyard, Diviner of Victory is a blue creature card whose mana value is 1. It can't
//     be the target of Stingcaster Mage's triggered ability ("When this creature enters, target
//     instant or sorcery card in your graveyard gains flashback until end of turn. The flashback
//     cost is equal to its mana cost.").
//   [2026-08-21] Preparation cards can be cast only with their base characteristics.
//   [2026-08-21] Only the current controller of a prepared creature can cast the copy of its
//     prepare spell in exile. It doesn't matter who owns that creature or who controlled it when
//     it became prepared.
//   [2026-08-21] Being prepared isn't a copiable value. If a permanent becomes a copy of a
//     prepared creature, it won't be prepared. That permanent will have the alternative
//     characteristics, though, and some other effect could cause it to become prepared later.
//   [2026-08-21] If an effect causes a creature to become unprepared, a prepared creature stops
//     being prepared and the associated copy of its prepare spell in exile ceases to exist. If it
//     wasn't prepared at that time, nothing happens.
//   [2026-08-21] If an effect instructs you to choose a card name, you may choose the alternative
//     prepare spell's name. Consider only the alternative characteristics to determine whether
//     that is an appropriate name to choose.
//   [2026-08-21] A creature with a prepare spell can't become prepared more than once at the same
//     time. For example, say Bloodline Recollector is on the battlefield and is prepared. During
//     the current turn, three creatures die. At the beginning of the end step, Bloodline
//     Recollector's last ability triggers. When that ability resolves, since Bloodline Recollector
//     is already prepared, the ability won't cause it to become prepared a second time or create a
//     second copy of Ancestral Craving in exile.
//   [2026-08-21] If a creature on the battlefield has {X} in its mana cost, X is 0 for the purpose
//     of determining its mana value.
//   [2026-08-21] If a prepare spell with one or more targets has no legal targets when it tries to
//     resolve, it won't resolve and none of its effects will happen. Since the spell was cast, the
//     associated permanent will still not be prepared.
//   [2026-08-21] As an effect causes a creature with a prepare spell to become prepared (including
//     effects that state that a creature "enters prepared"), that creature's controller creates a
//     copy of that creature's prepare spell in exile. That copy remains in exile for as long as
//     that permanent is on the battlefield and is prepared. That creature's controller may cast
//     that copy as long as it remains in exile. As they cast it, that creature stops being
//     prepared.
//   [2026-08-21] A creature without a prepare spell can't become prepared.
//   [2026-08-21] If a prepared creature loses all abilities, it won't stop being prepared, and
//     nothing will happen to its alternative characteristics or to the copy of its prepare spell
//     in exile.

export default defineCard({
  name: "Diviner of Victory",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Dwarf", "Wizard"],
  power: 1,
  toughness: 1,
  text: "This creature enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)\nWhenever you scry or surveil, this creature gets +1/+1 until end of turn.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", prepared: true },
      text: "This creature enters prepared.",
    },
  ],
  prepareSpell: "Unwind History",
  triggered: [
    {
      trigger: { on: "scries", who: "you", orSurveil: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever you scry or surveil, this creature gets +1/+1 until end of turn.",
    },
  ],
});
