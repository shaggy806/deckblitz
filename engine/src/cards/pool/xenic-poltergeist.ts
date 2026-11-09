import { defineCard } from "../define.js";

// Its P/T is read once, as the effect applies (rule 608.2h), like Karn's Touch.
const TEXT =
  "{T}: Until your next upkeep, target noncreature artifact becomes an artifact creature with power and toughness each equal to its mana value.";

export default defineCard({
  name: "Xenic Poltergeist",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { type: "artifact", notTypes: ["creature"] } }],
      effect: {
        kind: "become",
        target: 0,
        power: { manaValueOf: 0 },
        toughness: { manaValueOf: 0 },
        addTypes: ["artifact", "creature"],
        duration: "until-your-next-upkeep",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
