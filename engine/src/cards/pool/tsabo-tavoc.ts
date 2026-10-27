import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 23768. Protection from a quality a colour or card type can't
// name: legendary creatures (Yawgmoth's `filter`). The destroy targets only legendary
// creatures (the ruling).

export default defineCard({
  name: "Tsabo Tavoc",
  manaCost: "{5}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Horror"],
  power: 7,
  toughness: 4,
  keywords: ["first-strike"],
  text: "First strike, protection from legendary creatures\n{B}{B}, {T}: Destroy target legendary creature. It can't be regenerated.",
  static: [
    {
      affects: { scope: "self" },
      protection: { filter: { type: "creature", supertype: "legendary" } },
      text: "Protection from legendary creatures",
    },
  ],
  activated: [
    {
      cost: { mana: "{B}{B}", tap: true },
      targets: [{ kind: "permanent", filter: { supertype: "legendary", type: "creature" } }],
      effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
      resolve: null,
      text: "{B}{B}, {T}: Destroy target legendary creature. It can't be regenerated.",
    },
  ],
});
