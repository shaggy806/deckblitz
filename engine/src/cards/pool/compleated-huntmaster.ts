import { defineCard } from "../define.js";

// EDHREC rank 12028.

const TEXT = "{1}, {T}, Sacrifice another creature or artifact: Incubate 3.";

export default defineCard({
  name: "Compleated Huntmaster",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Elf", "Warrior"],
  power: 2,
  toughness: 3,
  text: `${TEXT} (Create an Incubator token with three +1/+1 counters on it and "{2}: Transform this token." It transforms into a 0/0 Phyrexian artifact creature.)`,
  activated: [
    {
      cost: {
        mana: "{1}",
        tap: true,
        sacrifice: { filter: { typesAnyOf: ["creature", "artifact"] } },
      },
      targets: [],
      effect: { kind: "incubate", amount: 3 },
      resolve: null,
      text: TEXT,
      otherOnly: true,
    },
  ],
});
