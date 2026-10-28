import { defineCard } from "../define.js";

// EDHREC rank 20231.

const TEXT =
  "Tap another untapped creature you control with flying: Radiant gains protection from the color of your choice until end of turn.";

export default defineCard({
  name: "Radiant, Serra Archangel",
  manaCost: "{6}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 6,
  toughness: 4,
  keywords: ["flying"],
  pairing: { kind: "partner" },
  text: `Flying\n${TEXT}\nPartner (You can have two commanders if both have partner.)`,
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 1, filter: { type: "creature", controlledBy: "you", keyword: "flying" } },
      },
      targets: [],
      effect: { kind: "grant-protection", target: "source", from: { choose: "color" }, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
