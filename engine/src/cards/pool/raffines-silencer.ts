import { defineCard } from "../define.js";

const DIES_TEXT =
  "When this creature dies, target creature an opponent controls gets -X/-X until end of turn, where X is this creature's power.";

export default defineCard({
  name: "Raffine's Silencer",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 1,
  toughness: 1,
  text:
    "When this creature enters, it connives. (Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on this creature.)\n" +
    DIES_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "connive", target: "source" },
      resolve: null,
      text: "When this creature enters, it connives.",
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: ["creature-an-opponent-controls"],
      // Its power as it last existed on the battlefield (the ruling; rule 608.2h).
      effect: {
        kind: "modify-pt",
        target: 0,
        power: { product: [{ powerOf: "source" }, -1] },
        toughness: { product: [{ powerOf: "source" }, -1] },
        duration: "end-of-turn",
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
