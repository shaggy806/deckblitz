import { defineCard } from "../define.js";
import { eternalizeAbility } from "../helpers.js";

// EDHREC rank 28693.
//
// Rulings:
//   The value of X is determined only as Resilient Khenra's triggered ability
//   resolves. Once that happens, the value of X won't change later in the
//   turn even if Resilient Khenra's power changes.
//   If Resilient Khenra's power is negative as its triggered ability
//   resolves, X is considered to be 0.
//   If Resilient Khenra leaves the battlefield before its triggered ability
//   resolves, use its power as it last existed on the battlefield.
//
// Wildwood Mentor's "+X/+X where X is its power": read once as it resolves,
// clamped at 0 (`ptChangeValue`), last-known if it has left.
const ENTERS =
  "When this creature enters, you may have target creature get +X/+X until end of turn, where X is this creature's power.";
const ETERNALIZE_TEXT =
  "Eternalize {4}{G}{G} ({4}{G}{G}, Exile this card from your graveyard: Create a token that's a copy of it, " +
  "except it's a 4/4 black Zombie Jackal Wizard with no mana cost. Eternalize only as a sorcery.)";

export default defineCard({
  name: "Resilient Khenra",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Jackal", "Wizard"],
  power: 2,
  toughness: 2,
  text: `${ENTERS}\n${ETERNALIZE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Have the target creature get +X/+X, where X is Resilient Khenra's power?",
        effect: {
          kind: "modify-pt",
          target: 0,
          power: { powerOf: "source" },
          toughness: { powerOf: "source" },
          duration: "end-of-turn",
        },
      },
      resolve: null,
      text: ENTERS,
    },
  ],
  activated: [eternalizeAbility("{4}{G}{G}", ETERNALIZE_TEXT)],
});
