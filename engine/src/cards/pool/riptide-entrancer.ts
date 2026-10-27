import { defineCard } from "../define.js";

// EDHREC rank 18305. Blind Zealot's shape (the target chosen as it triggers,
// the sacrifice a "may" as it resolves), with Thalakos Deceiver's lasting
// gain of control.

const TEXT =
  "Whenever this creature deals combat damage to a player, you may sacrifice it. If you do, gain control of target creature that player controls.";

export default defineCard({
  name: "Riptide Entrancer",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  morph: { keyword: "morph", cost: "{U}{U}" },
  text: `${TEXT} (This effect lasts indefinitely.)\nMorph {U}{U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [{ kind: "permanent", whose: "trigger-player", filter: { type: "creature" } }],
      effect: {
        kind: "may",
        prompt: "Sacrifice Riptide Entrancer to gain control of the targeted creature?",
        effect: { kind: "sacrifice-source", then: { kind: "gain-control", target: 0, untilEndOfTurn: false } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
