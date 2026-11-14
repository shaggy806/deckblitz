import { defineCard } from "../define.js";

// EDHREC rank 19663.
//
// "A spell you don't own" is one whose owner isn't its caster (Vaan, Street
// Thief's `ownedBy: "opponent"`). The exile is Dire Fleet Daredevil's
// cast-this-turn permission, any type of mana, the spell exiled instead of
// going to a graveyard; its timing stays the card's own (the ruling).

const CAST_TEXT = "Whenever you cast a spell you don't own, put a +1/+1 counter on each creature you control.";
const EXILE_TEXT =
  "{2}, Sacrifice another creature: Exile target instant or sorcery card from an opponent's graveyard. You may cast it this turn, and mana of any type can be spent to cast that spell. If that spell would be put into a graveyard, exile it instead. Activate only as a sorcery.";

export default defineCard({
  name: "Nita, Forum Conciliator",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 2,
  toughness: 3,
  text: `${CAST_TEXT}\n${EXILE_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { ownedBy: "opponent" } },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you" },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false, sacrifice: "creature-you-control" },
      otherOnly: true,
      sorcerySpeed: true,
      targets: [{ kind: "card-in-graveyard", whose: "opponent", filter: { typesAnyOf: ["instant", "sorcery"] } }],
      effect: {
        kind: "exile",
        target: 0,
        mayPlay: { duration: "end-of-turn", spendAs: "any-type", exileAfter: true },
      },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
});
