import { defineCard } from "../define.js";

const TEXT =
  "Whenever Rith deals combat damage to a player, you may pay {2}{G}. If you do, choose a color, then create a 1/1 green Saproling creature token for each permanent of that color.";

// "Choose a color" as it resolves, after the payment (the ruling): one mode
// per color, each counting every permanent of that color, whoever controls it.
const mode = (color: "W" | "U" | "B" | "R" | "G", name: string) =>
  ({
    text: name,
    effect: { kind: "create-token", token: "Saproling Token", count: { countOf: { colors: [color] } } },
  }) as const;

export default defineCard({
  name: "Rith, the Awakener",
  manaCost: "{3}{R}{G}{W}",
  colors: ["W", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2}{G} to choose a color and create a Saproling for each permanent of that color?",
        cost: "{2}{G}",
        effect: {
          kind: "modal",
          minModes: 1,
          maxModes: 1,
          modes: [mode("W", "White"), mode("U", "Blue"), mode("B", "Black"), mode("R", "Red"), mode("G", "Green")],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
