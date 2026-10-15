import { defineCard } from "../define.js";

// EDHREC rank 25599.

const ETB_TEXT = "When The Immortal Weapons enter, return target instant or sorcery card from your graveyard to your hand.";
const CAST_TEXT =
  "Whenever you cast a noncreature spell, target creature gets +2/+0 and gains menace until end of turn. (It can't be blocked except by two or more creatures.)";

export default defineCard({
  name: "The Immortal Weapons",
  manaCost: "{4}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Hero"],
  power: 4,
  toughness: 4,
  text: `${ETB_TEXT}\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["instant", "sorcery"] } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "menace", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
