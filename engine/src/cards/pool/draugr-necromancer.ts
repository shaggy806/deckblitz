import { defineCard } from "../define.js";

// EDHREC rank 11163.
//
// Rulings:
//   - Snow isn't a type of mana. If an effect says you may spend mana as
//     though it were any type, you can't pay for {S} using mana that wasn't
//     produced by a snow source.
//   - Casting a spell from exile this way follows the normal rules for
//     casting that spell. You must pay its costs, and you must follow all
//     applicable timing rules.
//   - If a nontoken land an opponent controls that's become a creature dies,
//     that card will be exiled with an ice counter, but Draugr Necromancer
//     doesn't allow you to play lands from exile.
//   - If an opponent controls a nontoken creature that you own and that
//     creature would die, it will be exiled with an ice counter on it.
//     However, you won't be able to cast that card from exile.
//   - The {S} symbol is a generic mana symbol. It represents a cost that can
//     be paid by one mana that was produced by a snow source.
//   - Snow is a supertype, not a card type.
//   - Draugr Necromancer allows you to cast spells from among any cards in
//     exile your opponents own with ice counters on them, including cards
//     that were exiled by previous Draugr Necromancers.
//
// The ice counter is put on as the card arrives in exile (Dauthi
// Voidwalker's `withCounters`). The permission reaches every opponent-owned
// card in exile with an ice counter, whoever exiled it, and casts only (no
// `play`: a land stays). Mana from a snow source pays any coloured pip of a
// spell cast this way as an `{S}` pip would (rule 609.4b; `SpendUnitAs`'s
// `unit: "snow"`); a `{C}` pip still wants colorless mana.
const REPLACE_TEXT =
  "If a nontoken creature an opponent controls would die, exile that card with an ice counter on it instead.";
const PLAY_TEXT =
  "You may cast spells from among cards in exile your opponents own with ice counters on them, and you may spend mana from snow sources as though it were mana of any color to cast those spells.";

export default defineCard({
  name: "Draugr Necromancer",
  art: "https://scryfall.com/card/khm/86",
  manaCost: "{3}{B}",
  colors: ["B"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Zombie", "Cleric"],
  power: 4,
  toughness: 4,
  text: `${REPLACE_TEXT}\n${PLAY_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-be-put-into-graveyard",
        instead: "exile",
        from: "battlefield",
        filter: { type: "creature", token: false, controlledBy: "opponent" },
        withCounters: { kind: "ice", amount: 1 },
      },
      text: REPLACE_TEXT,
    },
    {
      affects: { scope: "self" },
      mayPlay: {
        from: "exile",
        filter: { ownedBy: "opponent", counters: { kind: "ice", compare: { op: "gte", n: 1 } } },
        spendAs: { unit: "snow", as: "any-color" },
      },
      text: PLAY_TEXT,
    },
  ],
});
