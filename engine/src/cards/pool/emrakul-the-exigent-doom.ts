import { defineCard } from "../define.js";

const CAST = "When you cast this spell, untap all lands you control.";
const WARD = "Ward—Sacrifice three permanents.";
const LAND =
  "{3}, Exile this card from your hand: Target land gains \"{T}: Add {C}{C}\" until this card is cast from exile. You may cast this card for as long as it remains exiled.";

// The land's ability lasts `"until-source-cast"`, as Rakish Revelers' does:
// leaving exile any other way ends nothing (the ruling), and its mana may
// help cast Emrakul from exile.
export default defineCard({
  name: "Emrakul, the Exigent Doom",
  manaCost: "{10}",
  colors: [],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 12,
  toughness: 12,
  keywords: ["flying", "trample"],
  text: `${CAST}\nFlying, trample\n${WARD}\n${LAND}`,
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "untap-all", filter: { type: "land", controlledBy: "you" } },
      resolve: null,
      text: CAST,
    },
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { sacrifice: { filter: {}, count: 3, text: "Sacrifice three permanents" } } },
      resolve: null,
      text: WARD,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: ["land"],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "grant-activated",
            target: 0,
            ability: {
              cost: { mana: null, tap: true },
              targets: [],
              effect: { kind: "add-mana", mana: "C", amount: 2 },
              resolve: null,
              text: "{T}: Add {C}{C}.",
            },
            duration: "until-source-cast",
          },
          { kind: "grant-play", cards: "source", duration: "while-exiled" },
        ],
      },
      resolve: null,
      text: LAND,
      zone: "hand",
      exilesFromHand: true,
    },
  ],
});
