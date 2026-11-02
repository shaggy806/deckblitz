import { defineCard } from "../define.js";

export default defineCard({
  name: "Linvala, the Preserver",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Angel"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: "Flying\nWhen Linvala enters, if an opponent has more life than you, you gain 5 life.\nWhen Linvala enters, if an opponent controls more creatures than you, create a 3/3 white Angel creature token with flying.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "player-compare", stat: "life", compare: "fewer", than: "an-opponent" },
      targets: [],
      resolve: null,
      effect: { kind: "gain-life", amount: 5 },
      text: "When Linvala enters, if an opponent has more life than you, you gain 5 life.",
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "opponent-controls-more", filter: { type: "creature" } },
      targets: [],
      resolve: null,
      effect: { kind: "create-token", token: "3/3 White Angel Token", count: 1 },
      text: "When Linvala enters, if an opponent controls more creatures than you, create a 3/3 white Angel creature token with flying.",
    },
  ],
});
