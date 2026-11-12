import { defineCard } from "../define.js";

// Mystery Booster Commander Edition. Conjure is MTG Arena's (the `conjure`
// effect): a new Chitterspitter card you own, onto the battlefield. The forage
// is Curious Forager's; the sacrifice-a-token, Chitterspitter's own.
const ENTER_TEXT =
  "When Euru enters, you may forage. When you do, conjure a card named Chitterspitter onto the battlefield. (To forage, exile three cards from your graveyard or sacrifice a Food.)";
const DAMAGE_TEXT =
  "Whenever one or more Squirrels you control deal combat damage to a player, you may sacrifice a token. If you do, put an acorn counter on each permanent you control named Chitterspitter.";

export default defineCard({
  name: "Euru, Acorn Scrounger",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Squirrel", "Soldier"],
  power: 3,
  toughness: 3,
  text: `${ENTER_TEXT}\n${DAMAGE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [
          { exileFromGraveyard: 3, forage: true, text: "Exile three cards from your graveyard" },
          { sacrifice: { subtype: "Food" }, forage: true, text: "Sacrifice a Food" },
        ],
        ifDid: {
          kind: "reflexive-trigger",
          targets: [],
          effect: { kind: "conjure", name: "Chitterspitter", to: "battlefield" },
          text: "When you do, conjure a card named Chitterspitter onto the battlefield.",
        },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "deals-damage-batch", who: "you-control", filter: { subtype: "Squirrel" }, combat: true },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { token: true }, text: "Sacrifice a token" }],
        ifDid: {
          kind: "for-each-permanent",
          filter: { name: "Chitterspitter", controlledBy: "you" },
          effect: { kind: "add-counter", target: 0, counter: "acorn", amount: 1 },
        },
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
