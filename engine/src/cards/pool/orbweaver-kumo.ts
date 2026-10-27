import { defineCard } from "../define.js";

// EDHREC rank 31083.

const TEXT = "Whenever you cast a Spirit or Arcane spell, this creature gains forestwalk until end of turn. (It can't be blocked as long as defending player controls a Forest.)";

export default defineCard({
  name: "Orbweaver Kumo",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 4,
  keywords: ["reach"],
  text: `Reach (This creature can block creatures with flying.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { anyOf: [{ subtype: "Spirit" }, { subtype: "Arcane" }] } },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "forestwalk", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
