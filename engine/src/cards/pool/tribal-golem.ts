import { defineCard } from "../define.js";

// Onslaught (ONS). EDHREC rank 31991. Five Skirk Outrider-style conditions
// on itself, the last one Villainous Ogre's granted regeneration.

const TEXT =
  'This creature has trample as long as you control a Beast, haste as long as you control a Goblin, first strike as long as you control a Soldier, flying as long as you control a Wizard, and "{B}: Regenerate this creature" as long as you control a Zombie.';

const youControlA = (subtype: string) =>
  ({ kind: "controls", filter: { subtype }, atLeast: 1, countsSelf: true }) as const;

export default defineCard({
  name: "Tribal Golem",
  manaCost: "{6}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 4,
  toughness: 4,
  text: TEXT,
  static: [
    { affects: { scope: "self" }, condition: youControlA("Beast"), grantKeywords: ["trample"], text: TEXT },
    { affects: { scope: "self" }, condition: youControlA("Goblin"), grantKeywords: ["haste"], text: TEXT },
    { affects: { scope: "self" }, condition: youControlA("Soldier"), grantKeywords: ["first-strike"], text: TEXT },
    { affects: { scope: "self" }, condition: youControlA("Wizard"), grantKeywords: ["flying"], text: TEXT },
    {
      affects: { scope: "self" },
      condition: youControlA("Zombie"),
      grantsActivated: [
        {
          cost: { mana: "{B}", tap: false },
          targets: [],
          effect: { kind: "regenerate", target: "source" },
          resolve: null,
          text: "{B}: Regenerate this creature.",
        },
      ],
      text: TEXT,
    },
  ],
});
