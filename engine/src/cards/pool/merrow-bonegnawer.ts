import { defineCard } from "../define.js";

export default defineCard({
  name: "Merrow Bonegnawer",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Merfolk", "Rogue"],
  power: 1,
  toughness: 1,
  text: "{T}: Target player exiles a card from their graveyard.\nWhenever you cast a black spell, you may untap this creature.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["player"],
      effect: {
        kind: "for-each-player",
        who: { target: 0 },
        effect: { kind: "look-and-choose", player: "that-player", zone: "graveyard", min: 1, max: 1, destination: "exile", leftover: "stay" },
      },
      resolve: null,
      text: "{T}: Target player exiles a card from their graveyard.",
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["B"] } },
      targets: [],
      effect: { kind: "may", prompt: "Untap Merrow Bonegnawer?", effect: { kind: "untap", target: "source" } },
      resolve: null,
      text: "Whenever you cast a black spell, you may untap this creature.",
    },
  ],
});
