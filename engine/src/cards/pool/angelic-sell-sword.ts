import { thisOrAnother } from "../helpers.js";
import { defineCard } from "../define.js";

// EDHREC rank 8481.
//
// "This creature or another nontoken creature you control" is two triggers
// (`thisOrAnother`): the source's own entry counts whatever it is — a token
// copy of it too — and every other nontoken creature's. The draw's "if its
// power is 6 or greater" is an intervening if, asked as it attacks and again
// as the trigger resolves.
const ENTERS_TEXT =
  'Whenever this creature or another nontoken creature you control enters, create a 1/1 red Mercenary creature token with "{T}: Target creature you control gets +1/+0 until end of turn. Activate only as a sorcery."';
const ATTACK_TEXT = "Whenever this creature attacks, if its power is 6 or greater, draw a card.";

export default defineCard({
  name: "Angelic Sell-Sword",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel", "Mercenary"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${ENTERS_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature", token: false } },
      targets: [],
      effect: { kind: "create-token", token: "Mercenary Token", count: 1 },
      resolve: null,
      text: ENTERS_TEXT,
    }),
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "source", filter: { power: { op: "gte", n: 6 } } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
