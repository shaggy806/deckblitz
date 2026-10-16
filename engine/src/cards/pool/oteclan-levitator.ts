import { defineCard } from "../define.js";

export default defineCard({
  name: "Oteclan Levitator",
  art: "https://cards.scryfall.io/art_crop/back/0/9/099a1d1c-72ba-468e-9385-8f93e1fce001.jpg",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 1,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nWhenever this creature attacks, target attacking creature without flying gains flying until end of turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "permanent", whose: "any", filter: { type: "creature", attacking: true, notKeyword: "flying" } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: "Whenever this creature attacks, target attacking creature without flying gains flying until end of turn.",
    },
  ],
  faces: ["Oteclan Landmark", "Oteclan Levitator"],
  transform: true,
});
