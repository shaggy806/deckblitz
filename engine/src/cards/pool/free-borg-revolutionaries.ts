import { defineCard } from "../define.js";

// EDHREC rank 31132.

export default defineCard({
  name: "Free Borg Revolutionaries",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Borg", "Rebel"],
  power: 4,
  toughness: 5,
  cycling: { cost: "{2}", search: { supertype: "basic", type: "land" } },
  text: "When this creature enters, creatures you control get +1/+1 until end of turn.\nBasic landcycling {2} ({2}, Discard this card: Search your library for a basic land card, reveal it, put it into your hand, then shuffle.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "When this creature enters, creatures you control get +1/+1 until end of turn.",
    },
  ],
});
