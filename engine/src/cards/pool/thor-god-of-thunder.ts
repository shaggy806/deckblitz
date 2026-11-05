import { defineCard } from "../define.js";

const ETB_TEXT =
  "When Thor enters, exile target Equipment, instant, or sorcery card from your graveyard. Until the end of your next turn, you may play that card.";
const CAST_TEXT = "Whenever you cast a noncreature spell, Thor deals damage equal to that spell's mana value to any target.";

export default defineCard({
  name: "Thor, God of Thunder",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["God", "Warrior", "Hero"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${ETB_TEXT}\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { anyOf: [{ subtype: "Equipment" }, { typesAnyOf: ["instant", "sorcery"] }] },
        },
      ],
      effect: { kind: "exile", target: 0, mayCast: { duration: "your-next-turn", play: true } },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: ["any-target"],
      effect: { kind: "damage", amount: { manaValueOf: "trigger-object" }, target: 0 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
