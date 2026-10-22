import { defineCard } from "../define.js";

export default defineCard({
  name: "Unconventional Tactics",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text:
    "Target creature gets +3/+3 and gains flying until end of turn.\n" +
    "Whenever a Zombie you control enters, you may pay {W}. If you do, return this card from your graveyard to your hand.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
    ],
  },
  triggered: [
    {
      // Works only in the graveyard and returns this card (rule 113.6k).
      fromGraveyard: true,
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Zombie" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {W} to return Unconventional Tactics to your hand?",
        cost: "{W}",
        effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      },
      resolve: null,
      text: "Whenever a Zombie you control enters, you may pay {W}. If you do, return this card from your graveyard to your hand.",
    },
  ],
});
