import { defineCard } from "../define.js";

// EDHREC rank 8223.
//
// Rulings:
//   [2025-02-07] You choose the target card in your graveyard as Daretti’s second ability is put
//     on the stack, but you don’t choose whether to sacrifice an artifact or which one to
//     sacrifice until the ability resolves.
//   [2025-02-07] If an artifact on the battlefield has {X} in its mana cost, X is 0 when
//     determining its mana value.

const PT_TEXT = "Daretti's power is equal to the greatest mana value among artifacts you control.";
const RETURN_TEXT =
  "Whenever Daretti enters or attacks, choose target artifact card in your graveyard. You may sacrifice an artifact. If you do, return the chosen card to the battlefield.";

const returnTarget = [{ kind: "card-in-graveyard", whose: "you", filter: { type: "artifact" } }] as const;
// Yuma's "you may sacrifice a land. If you do, …": which artifact, and
// whether, is asked as it resolves (the ruling).
const sacrificeToReturn = {
  kind: "each-player-may",
  who: "you",
  options: [{ sacrifice: { type: "artifact" }, text: "Sacrifice an artifact" }],
  ifDid: { kind: "put-onto-battlefield", target: 0 },
} as const;

export default defineCard({
  name: "Daretti, Rocketeer Engineer",
  manaCost: "{4}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Goblin", "Artificer"],
  power: 0,
  toughness: 5,
  text: `${PT_TEXT}\n${RETURN_TEXT}`,
  static: [
    {
      // A power-only CDA over the printed 5 toughness (Karn, Legacy
      // Reforged's count).
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { greatestManaValueOf: { type: "artifact", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
        only: "power",
      },
      text: PT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [...returnTarget],
      effect: sacrificeToReturn,
      resolve: null,
      text: RETURN_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [...returnTarget],
      effect: sacrificeToReturn,
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
