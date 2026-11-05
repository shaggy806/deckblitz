import { defineCard } from "../define.js";

// Glamorous Outlaw's hand ability.
const ENTERS = "When this creature enters, target creature an opponent controls can't attack or block until your next turn.";
const LAND =
  "{2}, Exile this card from your hand: Target land gains \"{T}: Add {G}, {W}, or {U}\" until this card is cast from exile. You may cast this card for as long as it remains exiled.";

export default defineCard({
  name: "Spara's Adjudicators",
  manaCost: "{2}{G}{W}{U}",
  colors: ["W", "U", "G"],
  types: ["creature"],
  subtypes: ["Cat", "Citizen"],
  power: 4,
  toughness: 4,
  text: `${ENTERS}\n${LAND}`,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
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
              effect: { kind: "add-mana", mana: { oneOf: ["G", "W", "U"] }, amount: 1 },
              resolve: null,
              text: "{T}: Add {G}, {W}, or {U}.",
            },
            duration: "until-source-cast",
          },
          { kind: "allow-cast-from-exile", target: "source", whileExiled: true },
        ],
      },
      resolve: null,
      text: LAND,
      zone: "hand",
      exilesFromHand: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-attack", "cant-block"], duration: "until-your-next-turn" },
      resolve: null,
      text: ENTERS,
    },
  ],
});
