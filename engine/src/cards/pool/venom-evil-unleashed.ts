import { defineCard } from "../define.js";

const GRAVE_TEXT =
  "{2}{B}, Exile this card from your graveyard: Put two +1/+1 counters on target creature. It gains deathtouch until end of turn. Activate only as a sorcery.";

export default defineCard({
  name: "Venom, Evil Unleashed",
  manaCost: "{4}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Symbiote", "Villain"],
  power: 4,
  toughness: 5,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${GRAVE_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
          { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: GRAVE_TEXT,
      zone: "graveyard",
      sorcerySpeed: true,
    },
  ],
});
