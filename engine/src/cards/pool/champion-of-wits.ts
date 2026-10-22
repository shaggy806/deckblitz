import { defineCard } from "../define.js";
import { eternalizeAbility } from "../helpers.js";

// EDHREC rank 7221.
//
// Rulings:
//   Use Champion of Wits's power as the first ability resolves to determine if
//   you want to use the ability and how many cards you draw if you do. If you
//   use the ability, you discard two cards regardless of how many cards you
//   draw. If Champion of Wits leaves the battlefield before that ability
//   resolves, use its last known power.
//
// Horrid Shadowspinner's shape: "if you do" is saying yes to the draw, and the
// discard is always two. The eternalized 4/4 copy draws four.
const ENTERS =
  "When this creature enters, you may draw cards equal to its power. If you do, discard two cards.";
const ETERNALIZE_TEXT =
  "Eternalize {5}{U}{U} ({5}{U}{U}, Exile this card from your graveyard: Create a token that's a copy of it, " +
  "except it's a 4/4 black Zombie Snake Wizard with no mana cost. Eternalize only as a sorcery.)";

export default defineCard({
  name: "Champion of Wits",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Snake", "Wizard"],
  power: 2,
  toughness: 1,
  text: `${ENTERS}\n${ETERNALIZE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Draw cards equal to Champion of Wits's power, then discard two cards?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: { powerOf: "source" } },
            { kind: "discard", target: "you", amount: 2 },
          ],
        },
      },
      resolve: null,
      text: ENTERS,
    },
  ],
  activated: [eternalizeAbility("{5}{U}{U}", ETERNALIZE_TEXT)],
});
