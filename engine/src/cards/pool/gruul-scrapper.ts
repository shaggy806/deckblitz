import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 31599. Jaded Sell-Sword's shape, gated on {R} spent.

const TEXT = "When this creature enters, if {R} was spent to cast it, it gains haste until end of turn.";

export default defineCard({
  name: "Gruul Scrapper",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Berserker"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { manaSpentOfColors: { R: 1 } } },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "haste", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
