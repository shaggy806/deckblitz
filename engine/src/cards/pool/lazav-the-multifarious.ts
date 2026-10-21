import { defineCard } from "../define.js";

// EDHREC rank 8876.
//
// Likeness Looter's shape, at instant speed: the copy has no duration (rule
// 611.2a) and copies only what's printed on the card (an {X} in its cost is
// 0); its name, legendary and this ability are copiable exceptions (rule
// 707.9a-b). Lazav keeps his counters and the effects on him, and enters
// nothing, so no "enters" ability of the card applies (rule 707.4).
const SURVEIL_TEXT = "When Lazav enters, surveil 1.";
const COPY_TEXT =
  "{X}: Lazav becomes a copy of target creature card in your graveyard with mana value X, except its name is Lazav, the Multifarious, it's legendary in addition to its other types, and it has this ability.";

export default defineCard({
  name: "Lazav, the Multifarious",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 1,
  toughness: 3,
  text: `When Lazav enters, surveil 1. (Look at the top card of your library. You may put it into your graveyard.)\n${COPY_TEXT}`,
  activated: [
    {
      cost: { mana: "{X}", tap: false },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { type: "creature", manaValue: { op: "eq", n: "x" } },
        },
      ],
      effect: {
        kind: "become-copy",
        target: "source",
        of: 0,
        exceptions: {
          name: "Lazav, the Multifarious",
          addSupertypes: ["legendary"],
          thisAbility: { card: "Lazav, the Multifarious", activated: 0 },
        },
      },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: SURVEIL_TEXT,
    },
  ],
});
