import { defineCard } from "../define.js";

export default defineCard({
  name: "Tiamat",
  manaCost: "{2}{W}{U}{B}{R}{G}",
  colors: ["W", "U", "B", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon", "God"],
  power: 7,
  toughness: 7,
  keywords: ["flying"],
  text: "Flying\nWhen Tiamat enters, if you cast it, search your library for up to five Dragon cards not named Tiamat that each have different names, reveal them, put them into your hand, then shuffle.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { cast: true, castBy: "you" } },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { subtype: "Dragon", notName: "Tiamat" },
        together: { distinctNames: true },
        destination: "hand",
        min: 0,
        max: 5,
        reveal: true,
      },
      resolve: null,
      text: "When Tiamat enters, if you cast it, search your library for up to five Dragon cards not named Tiamat that each have different names, reveal them, put them into your hand, then shuffle.",
    },
  ],
});
