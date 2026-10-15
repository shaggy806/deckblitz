import { defineCard } from "../define.js";

// EDHREC rank 15696. The return is Gallia, Tragic Host's graveyard ability:
// the card stays in the graveyard as it's activated and returns if it's still
// the same card there when the ability resolves.

const RETURN_TEXT =
  "{1}{B}, Exile an instant or sorcery card from your graveyard: Return this card from your graveyard to the battlefield.";

export default defineCard({
  name: "Postmortem Professor",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Warlock"],
  power: 2,
  toughness: 2,
  text: `This creature can't block.\nWhenever this creature attacks, each opponent loses 1 life and you gain 1 life.\n${RETURN_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-block"],
      text: "This creature can't block.",
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, who: "each-opponent" },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: "Whenever this creature attacks, each opponent loses 1 life and you gain 1 life.",
    },
  ],
  activated: [
    {
      cost: {
        mana: "{1}{B}",
        tap: false,
        exileFromGraveyard: { count: 1, filter: { typesAnyOf: ["instant", "sorcery"] } },
      },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
