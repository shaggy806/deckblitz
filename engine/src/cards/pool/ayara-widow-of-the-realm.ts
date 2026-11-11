import { defineCard } from "../define.js";

// EDHREC rank 7322. Front face of a transforming double-faced card.
//
// Ruling: the first ability uses the mana value of the permanent you
// sacrificed as it last existed on the battlefield.
//
// "Target opponent or battle" is one slot: a battle, or an opponent
// (`orPlayer`). X is Broadside Bombardiers' sacrificed mana value.

const DRAIN_TEXT =
  "{T}, Sacrifice another creature or artifact: Ayara deals X damage to target opponent or battle and you gain X life, where X is the sacrificed permanent's mana value.";
const TRANSFORM_TEXT = "{5}{R/P}: Transform Ayara. Activate only as a sorcery. ({R/P} can be paid with either {R} or 2 life.)";
const X = { manaValueOf: { paid: "sacrificed" } } as const;

export default defineCard({
  name: "Ayara, Widow of the Realm",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Noble"],
  power: 3,
  toughness: 3,
  text: `${DRAIN_TEXT}\n${TRANSFORM_TEXT}`,
  activated: [
    {
      cost: {
        mana: null,
        tap: true,
        sacrifice: { filter: { typesAnyOf: ["creature", "artifact"], controlledBy: "you" } },
      },
      otherOnly: true,
      targets: [{ kind: "permanent", filter: { type: "battle" }, orPlayer: "opponent" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: X, target: 0 },
          { kind: "gain-life", amount: X },
        ],
      },
      resolve: null,
      text: DRAIN_TEXT,
    },
    {
      cost: { mana: "{5}{R/P}", tap: false },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      sorcerySpeed: true,
      text: TRANSFORM_TEXT,
    },
  ],
  faces: ["Ayara, Widow of the Realm", "Ayara, Furnace Queen"],
  transform: true,
});
