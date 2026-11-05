import { defineCard } from "../define.js";

// EDHREC rank 4516. "If you do" reads the flicker's return (`this-way`,
// Hallowed Respite's shape): with two nontoken creatures dying at once, the
// second trigger's Liliana is a new object, nothing is flickered, and no
// second Zombie comes (the ruling).

const TEXT =
  "Whenever another nontoken creature you control dies, exile Liliana, Heretical Healer, then return her to the battlefield transformed under her owner's control. If you do, create a 2/2 black Zombie creature token.";

export default defineCard({
  name: "Liliana, Heretical Healer",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 3,
  keywords: ["lifelink"],
  text: `Lifelink\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { token: false, type: "creature" }, otherOnly: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "flicker", target: "source", transformed: true },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "put-onto-battlefield" },
            then: { kind: "create-token", token: "Zombie Token", count: 1 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Liliana, Heretical Healer", "Liliana, Defiant Necromancer"],
  transform: true,
});
