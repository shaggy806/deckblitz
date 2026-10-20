import { defineCard } from "../define.js";

const TEXT = "When this creature enters, another target creature you control gains deathtouch until end of turn.";

export default defineCard({
  name: "Toxic Scorpion",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Scorpion"],
  power: 1,
  toughness: 1,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
