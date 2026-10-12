import { defineCard } from "../define.js";

export default defineCard({
  name: "Arni, Humble Scribe",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 2,
  text: "Whenever another nontoken creature you control enters, untap Arni.\n{T}: Draw a card, then discard a card.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "draw", amount: 1 }, { kind: "discard", target: "you", amount: 1 }],
      },
      resolve: null,
      text: "{T}: Draw a card, then discard a card.",
    },
  ],
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { token: false, type: "creature" },
        otherOnly: true,
      },
      targets: [],
      effect: { kind: "untap", target: "source" },
      resolve: null,
      text: "Whenever another nontoken creature you control enters, untap Arni.",
    },
  ],
});
