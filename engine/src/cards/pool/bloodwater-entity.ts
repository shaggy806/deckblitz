import { defineCard } from "../define.js";

export default defineCard({
  name: "Bloodwater Entity",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nProwess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)\nWhen this creature enters, you may put target instant or sorcery card from your graveyard on top of your library.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)",
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["instant", "sorcery"] } }],
      effect: {
        kind: "may",
        prompt: "Put the targeted instant or sorcery card on top of your library?",
        effect: { kind: "put-on-library", target: 0, position: "top" },
      },
      resolve: null,
      text: "When this creature enters, you may put target instant or sorcery card from your graveyard on top of your library.",
    },
  ],
});
