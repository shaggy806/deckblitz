import { defineCard } from "../define.js";

// EDHREC rank 6054.
//
// Rulings:
//   [2025-10-02] Tokens exiled this way will cease to exist and cannot be cast.
//   [2025-10-02] Lands exiled this way cannot be played from exile.
//   [2025-10-02] If the spell you cast has {X} in its mana cost, you must choose 0 as the value of
//     X.
//   [2025-10-02] Since you are using an alternative cost to cast a spell from exile this way, you
//     can't pay any other alternative costs. You can, however, pay additional costs, such as
//     kicker costs. If the card has any mandatory additional costs, you must pay those.
//   [2025-10-02] To airbend one or more permanents and/or spells means to exile each of those
//     objects. For each card exiled this way, for as long as it's exiled, its owner may cast it
//     from exile by paying {2} rather than paying its mana cost.
//
// Airbend (rule 701.65a) is an `exile` with `airbend`: the card's owner gets
// the {2} cast from exile (the `"airbend"` cast).
const ETB_TEXT = "When Aang enters, airbend up to one other target nonland permanent.";
const LESSON_TEXT = "Whenever you cast a Lesson spell, Aang gains lifelink until end of turn.";

export default defineCard({
  name: "Aang, the Last Airbender",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Avatar", "Ally"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${ETB_TEXT} (Exile it. While it's exiled, its owner may cast it for {2} rather than its mana cost.)\n${LESSON_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "other", of: "nonland-permanent" } }],
      effect: { kind: "exile", target: 0, airbend: true },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { subtype: "Lesson" } },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "lifelink", duration: "end-of-turn" },
      resolve: null,
      text: LESSON_TEXT,
    },
  ],
});
