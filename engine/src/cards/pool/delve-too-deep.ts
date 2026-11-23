import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2). X is the announced X, whatever paid it
// (delve pays generic mana, X's included — rule 702.66a).
export default defineCard({
  name: "Delve too Deep",
  manaCost: "{X}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Delve (Each card you exile from your graveyard while casting this spell pays for {1}.)\nTarget creature gets -X/-X until end of turn. If X was 7 or greater, create a 7/7 black and red Demon creature token.",
  delve: true,
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt",
        target: 0,
        power: { product: ["x", -1] },
        toughness: { product: ["x", -1] },
        duration: "end-of-turn",
      },
      {
        kind: "conditional",
        condition: { kind: "x", compare: { op: "gte", n: 7 } },
        then: { kind: "create-token", token: "7/7 Black Red Demon Token", count: 1 },
      },
    ],
  },
});
