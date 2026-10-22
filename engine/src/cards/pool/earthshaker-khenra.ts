import { defineCard } from "../define.js";
import { eternalizeAbility } from "../helpers.js";

// The target's power is checked against this creature's as it's targeted and
// again as the ability resolves (its ruling) — The Master, Mesmerist's
// `powerOf: "source"` filter. The eternalized 4/4 reads its own 4.
const ENTER_TEXT =
  "When this creature enters, target creature with power less than or equal to this creature's power can't block this turn.";
const ETERNALIZE_TEXT =
  "Eternalize {4}{R}{R} ({4}{R}{R}, Exile this card from your graveyard: Create a token that's a copy of it, " +
  "except it's a 4/4 black Zombie Jackal Warrior with no mana cost. Eternalize only as a sorcery.)";

export default defineCard({
  name: "Earthshaker Khenra",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Jackal", "Warrior"],
  power: 2,
  toughness: 1,
  keywords: ["haste"],
  text: `Haste\n${ENTER_TEXT}\n${ETERNALIZE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "permanent",
          filter: { type: "creature", power: { op: "lte", n: { amount: { powerOf: "source" } } } },
        },
      ],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [eternalizeAbility("{4}{R}{R}", ETERNALIZE_TEXT)],
});
