import { defineCard } from "../define.js";

// EDHREC rank 12644. Wilds of Eldraine (Commander-legal first printing). The
// attack trigger is The Goose Mother's "you may sacrifice a Food. If you do";
// "attacking creatures" is every creature attacking as it resolves (rule
// 611.2c), Glorious Sunrise's pump narrowed to them.
const ENTER_TEXT = "When this creature enters, create a Food token.";
const ATTACK_TEXT =
  "Whenever this creature attacks, you may sacrifice a Food. If you do, attacking creatures get +1/+1 and gain trample until end of turn.";

const ATTACKING = { type: "creature", attacking: true } as const;

export default defineCard({
  name: "Provisions Merchant",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast", "Peasant"],
  power: 3,
  toughness: 3,
  text:
    "When this creature enters, create a Food token. (It's an artifact with \"{2}, {T}, Sacrifice this token: You gain 3 life.\")\n" +
    ATTACK_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { subtype: "Food" }, text: "Sacrifice a Food" }],
        ifDid: {
          kind: "sequence",
          effects: [
            { kind: "modify-pt-all", filter: ATTACKING, power: 1, toughness: 1, duration: "end-of-turn" },
            { kind: "grant-keyword-all", filter: ATTACKING, keyword: "trample", duration: "end-of-turn" },
          ],
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
