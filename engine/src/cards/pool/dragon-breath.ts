import { defineCard } from "../define.js";

// EDHREC rank 17646.

export default defineCard({
  name: "Dragon Breath",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature has haste.\n{R}: Enchanted creature gets +1/+0 until end of turn.\nWhen a creature with mana value 6 or greater enters, you may return this card from your graveyard to the battlefield attached to that creature.",
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "attached", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{R}: Enchanted creature gets +1/+0 until end of turn.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["haste"],
      text: "Enchanted creature has haste.",
    },
  ],
  triggered: [
    {
      // From the graveyard, on any player's creature (Smoke Shroud's shape). If
      // that creature is no longer the same object, or this can't enchant it,
      // this card stays in the graveyard (rule 303.4i).
      fromGraveyard: true,
      trigger: {
        on: "enters-battlefield",
        who: "any",
        filter: { type: "creature", manaValue: { op: "gte", n: 6 } },
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return Dragon Breath from your graveyard to the battlefield attached to that creature?",
        effect: { kind: "put-onto-battlefield", target: "source", attachedTo: "trigger-object" },
      },
      resolve: null,
      text: "When a creature with mana value 6 or greater enters, you may return this card from your graveyard to the battlefield attached to that creature.",
    },
  ],
});
