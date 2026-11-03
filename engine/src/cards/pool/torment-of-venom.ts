import { defineCard } from "../define.js";

// Hour of Devastation. "Another" is other than the target creature, so the
// sacrifice option leaves that slot out. The counters go on first, and state-
// based actions wait for the resolution to finish, so the creature is still
// there to be its controller's, and still not a sacrifice to choose.

export default defineCard({
  name: "Torment of Venom",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Put three -1/-1 counters on target creature. Its controller loses 3 life unless they sacrifice another nonland permanent of their choice or discard a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "-1/-1", amount: 3 },
      {
        kind: "unless",
        chooser: { controllerOfTarget: 0 },
        options: [
          {
            sacrifice: { notTypes: ["land"] },
            exceptTarget: 0,
            text: "Sacrifice another nonland permanent",
          },
          { discard: 1, text: "Discard a card" },
        ],
        otherwise: {
          kind: "as-player",
          who: { controllerOfTarget: 0 },
          effect: { kind: "lose-life", amount: 3, who: "you" },
        },
      },
    ],
  },
});
