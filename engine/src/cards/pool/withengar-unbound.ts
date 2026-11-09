import { defineCard } from "../define.js";

// Back face of Elbrus, the Binding Blade. Any loss counts (its ruling): a
// state-based one, an effect's, a concession.
export default defineCard({
  name: "Withengar Unbound",
  art: "https://cards.scryfall.io/art_crop/back/6/8/683af377-c491-4f62-900c-6b83d75c33c9.jpg",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 13,
  toughness: 13,
  keywords: ["flying", "intimidate", "trample"],
  text: "Flying, intimidate, trample (A creature with intimidate can't be blocked except by artifact creatures and/or creatures that share a color with it.)\nWhenever a player loses the game, put thirteen +1/+1 counters on Withengar Unbound.",
  triggered: [
    {
      trigger: { on: "event", event: "loses-game", who: "any" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 13 },
      resolve: null,
      text: "Whenever a player loses the game, put thirteen +1/+1 counters on Withengar Unbound.",
    },
  ],
  faces: ["Elbrus, the Binding Blade", "Withengar Unbound"],
  transform: true,
});
