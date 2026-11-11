import { defineCard } from "../define.js";

// "That player" is the opponent controlling the targeting spell or ability
// (`whose: "trigger-player"`, as Black Bolt, Inhuman King's).
export default defineCard({
  name: "Scalelord Reckoner",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text:
    "Flying\n" +
    "Whenever a Dragon you control becomes the target of a spell or ability an opponent controls, destroy target nonland permanent that player controls.",
  triggered: [
    {
      trigger: { on: "becomes-target", who: "you-control", filter: { subtype: "Dragon" }, byOpponentOnly: true },
      targets: [{ kind: "permanent", whose: "trigger-player", filter: { notTypes: ["land"] } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "Whenever a Dragon you control becomes the target of a spell or ability an opponent controls, destroy target nonland permanent that player controls.",
    },
  ],
});
