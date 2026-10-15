import { defineCard } from "../define.js";

// Squirrel Nest's granted land ability, with Brave-Kin Duo's sorcery-speed
// pump; the count of creatures is the land's controller's, read as the
// ability resolves (the ruling).
const GRANT_TEXT =
  'Enchanted land has "{1}, {T}: Target creature gets +1/+1 until end of turn for each creature you control. Activate only as a sorcery."';

export default defineCard({
  name: "Friendly Neighborhood",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\nWhen this Aura enters, create three 1/1 green and white Human Citizen creature tokens.\n${GRANT_TEXT}`,
  targets: ["land"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Human Citizen Token", count: 3 },
      resolve: null,
      text: "When this Aura enters, create three 1/1 green and white Human Citizen creature tokens.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: "{1}", tap: true },
          targets: ["creature"],
          effect: {
            kind: "modify-pt",
            target: 0,
            power: { countOf: { type: "creature", controlledBy: "you" } },
            toughness: { countOf: { type: "creature", controlledBy: "you" } },
            duration: "end-of-turn",
          },
          sorcerySpeed: true,
          resolve: null,
          text: "{1}, {T}: Target creature gets +1/+1 until end of turn for each creature you control. Activate only as a sorcery.",
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
