import { defineCard } from "../define.js";

// Zanarkand, Ancient Metropolis's Adventure. The counters go on once the token
// has entered, counted as this resolves.
export default defineCard({
  name: "Lasting Fayth",
  art: "https://cards.scryfall.io/art_crop/back/8/8/881e4c00-3b9a-47a1-bf66-1badda994c88.jpg",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Create a 1/1 colorless Hero creature token. Put a +1/+1 counter on it for each land you control. (Then exile this card. You may play the land later from exile.)",
  targets: [],
  effect: {
    kind: "create-token",
    token: "Hero Token (Black Mage's Rod)",
    count: 1,
    thenCounters: { kind: "+1/+1", amount: { countOf: { type: "land", controlledBy: "you" } } },
  },
});
