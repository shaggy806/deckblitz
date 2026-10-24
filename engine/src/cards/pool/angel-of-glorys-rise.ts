import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, exile all Zombies, then return all Human creature cards from your graveyard to the battlefield.";

// Ruling: only Zombie permanents are exiled, not Zombie cards elsewhere.
export default defineCard({
  name: "Angel of Glory's Rise",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 4,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile-all", filter: { subtype: "Zombie" } },
          {
            kind: "return-from-graveyard",
            filter: { type: "creature", subtype: "Human" },
            destination: "battlefield",
            count: "all",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
