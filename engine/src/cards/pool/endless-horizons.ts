import { defineCard } from "../define.js";

const ENTERS = "When this enchantment enters, search your library for any number of Plains cards, exile them, then shuffle.";
const UPKEEP = "At the beginning of your upkeep, you may put a card you own exiled with this enchantment into your hand.";

// The Plains are exiled with this object: a new Endless Horizons has none, and
// another player who gains control of it gets nothing — the cards aren't
// theirs (the rulings).
export default defineCard({
  name: "Endless Horizons",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${ENTERS}\n${UPKEEP}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { subtype: "Plains" },
        destination: "exile",
        linked: true,
        min: 0,
        max: { librarySize: "you" },
      },
      resolve: null,
      text: ENTERS,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "exiled-with-source",
        min: 0,
        max: 1,
        filter: { ownedBy: "you" },
        destination: "hand",
        leftover: "stay",
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
