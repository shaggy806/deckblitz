import { defineCard } from "../define.js";

// The last mode sets base power and toughness (layer 7b — Multiply by Zero's
// shape): counters and "gets +N/+N" effects still apply on top (the ruling).
export default defineCard({
  name: "Quandrix Charm",
  manaCost: "{G}{U}",
  colors: ["G", "U"],
  types: ["instant"],
  text:
    "Choose one —\n" +
    "• Counter target spell unless its controller pays {2}.\n" +
    "• Destroy target enchantment.\n" +
    "• Target creature has base power and toughness 5/5 until end of turn.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Counter target spell unless its controller pays {2}.",
        targets: ["spell"],
        effect: {
          kind: "unless",
          chooser: 0,
          options: [{ pay: "{2}", text: "Pay {2}" }],
          otherwise: { kind: "counter", target: 0 },
        },
      },
      {
        text: "Destroy target enchantment.",
        targets: ["enchantment"],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: "Target creature has base power and toughness 5/5 until end of turn.",
        targets: ["creature"],
        effect: {
          kind: "animate",
          target: 0,
          power: 5,
          toughness: 5,
          addTypes: [],
          addSubtypes: [],
          duration: "end-of-turn",
        },
      },
    ],
  },
});
