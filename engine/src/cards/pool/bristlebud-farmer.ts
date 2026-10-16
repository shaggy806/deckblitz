import { defineCard } from "../define.js";

// EDHREC rank 8615.
//
// The attack trigger is The Goose Mother's "you may sacrifice a Food. If you
// do, …" with Oko, Shadowmoor Scion's "mill three cards. You may put a
// permanent card from among them into your hand" as the `ifDid`.
const ENTERS_TEXT = "When this creature enters, create two Food tokens.";
const ATTACK_TEXT =
  "Whenever this creature attacks, you may sacrifice a Food. If you do, mill three cards. You may put a permanent card from among them into your hand.";

export default defineCard({
  name: "Bristlebud Farmer",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Plant", "Druid"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  text: `Trample\n${ENTERS_TEXT} (They're artifacts with "{2}, {T}, Sacrifice this token: You gain 3 life.")\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 2 },
      resolve: null,
      text: ENTERS_TEXT,
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
            { kind: "mill", target: "you", amount: 3 },
            {
              kind: "look-and-choose",
              zone: "graveyard",
              min: 0,
              max: 1,
              destination: "hand",
              leftover: "stay",
              filter: { thisWay: "milled", typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"] },
            },
          ],
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
