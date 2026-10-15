import { defineCard } from "../define.js";

// EDHREC rank 25942.

export default defineCard({
  name: "Icy Reception",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Choose one —\n• Counter target creature or legendary spell unless its controller pays {3}.\n• Target creature gets -5/-0 until end of turn.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Counter target creature or legendary spell unless its controller pays {3}.",
        targets: [{ kind: "spell", filter: { anyOf: [{ type: "creature" }, { supertype: "legendary" }] } }],
        effect: {
          kind: "unless",
          chooser: 0,
          options: [{ pay: "{3}", text: "Pay {3}" }],
          otherwise: { kind: "counter", target: 0 },
        },
      },
      {
        text: "Target creature gets -5/-0 until end of turn.",
        targets: ["creature"],
        effect: { kind: "modify-pt", target: 0, power: -5, toughness: 0, duration: "end-of-turn" },
      },
    ],
  },
});
