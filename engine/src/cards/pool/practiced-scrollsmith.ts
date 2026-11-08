import { defineCard } from "../define.js";

// EDHREC rank 15472.

export default defineCard({
  name: "Practiced Scrollsmith",
  manaCost: "{R}{R/W}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Dwarf", "Cleric"],
  power: 3,
  toughness: 2,
  keywords: ["first-strike"],
  text: "First strike\nWhen this creature enters, exile target noncreature, nonland card from your graveyard. Until the end of your next turn, you may cast that card.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { notTypes: ["creature", "land"] } }],
      effect: { kind: "exile", target: 0, mayPlay: { duration: "until-end-of-your-next-turn" } },
      resolve: null,
      text: "When this creature enters, exile target noncreature, nonland card from your graveyard. Until the end of your next turn, you may cast that card.",
    },
  ],
});
