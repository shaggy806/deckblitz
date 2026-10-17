import { defineCard } from "../define.js";

// EDHREC rank 12337.
//
// Rulings:
//   [2023-10-13] Paradox abilities count any spells cast from zones other than your hand. These
//     are usually spells cast from exile, the graveyard, or the command zone. They also count
//     spells cast from outside the game, such as spells cast with Wish or Garth One-Eye's ability.
//   [2023-10-13] If a spell or ability allows you to copy a spell on the stack but doesn't specify
//     that the spell is cast, that spell wasn't cast and won't be counted by paradox abilities.
//
// Paradox is `notFrom: "hand"`; the doubling is Mossborn Hydra's
// `double-counters` of +1/+1 counters on the source.
const ENTER_TEXT = "This creature enters with a +1/+1 counter on it.";
const PARADOX_TEXT =
  "Paradox — Whenever you cast a spell from anywhere other than your hand, double the number of +1/+1 counters on this creature.";

export default defineCard({
  name: "Sisterhood of Karn",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Cleric"],
  power: 0,
  toughness: 0,
  text: `${ENTER_TEXT}\n${PARADOX_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 1 } },
      text: ENTER_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", notFrom: "hand" },
      targets: [],
      effect: { kind: "double-counters", target: "source", counter: "+1/+1" },
      resolve: null,
      text: PARADOX_TEXT,
    },
  ],
});
