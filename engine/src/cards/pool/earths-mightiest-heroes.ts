import { defineCard } from "../define.js";

const LOOK = {
  kind: "look-and-choose",
  zone: "library",
  count: 8,
  reveal: true,
  min: 0,
  filter: { type: "creature" },
  destination: "battlefield",
  leftover: "graveyard",
} as const;

export default defineCard({
  name: "Earth's Mightiest Heroes",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text:
    "Teamwork 5 (As an additional cost to cast this spell, you may tap any number of creatures you control with total power 5 or more.)\n" +
    "Reveal the top eight cards of your library. You may put a creature card from among them onto the battlefield. If this spell was cast using teamwork, put any number of creature cards from among them onto the battlefield instead. Put the rest into your graveyard.",
  effect: { ...LOOK, max: 1 },
  kicker: { cost: "", keyword: "teamwork", teamwork: 5, effect: { ...LOOK, max: 8 } },
});
