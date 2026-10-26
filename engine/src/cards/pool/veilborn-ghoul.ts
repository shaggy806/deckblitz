import { defineCard } from "../define.js";

const TEXT = "Whenever a Swamp you control enters, you may return this card from your graveyard to your hand.";

export default defineCard({
  name: "Veilborn Ghoul",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 4,
  toughness: 1,
  text: `This creature can't block.\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-block"],
      text: "This creature can't block.",
    },
  ],
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Swamp" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return Veilborn Ghoul from your graveyard to your hand?",
        effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
