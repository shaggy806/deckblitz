import { defineCard } from "../define.js";

// EDHREC rank 17553.

const GRAVEYARD_TEXT =
  "{1}{U}, Exile this card from your graveyard: Put a +1/+1 counter on target creature. It gains flying until end of turn. Activate only as a sorcery.";

export default defineCard({
  name: "Beetle, Legacy Criminal",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue", "Villain"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${GRAVEYARD_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{U}", tap: false },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: GRAVEYARD_TEXT,
      zone: "graveyard",
      sorcerySpeed: true,
    },
  ],
});
