import { defineCard } from "../define.js";

// Shadows over Innistrad (SOI). Any player's instant or sorcery spell: the
// trigger's `spellFilter` reads the spell as it is on the stack. A Wolf or
// Werewolf of any card type (Kindred Wolves included).

const TEXT =
  "Whenever a Wolf or Werewolf you control becomes the target of an instant or sorcery spell, create a 2/2 green Wolf creature token.";

export default defineCard({
  name: "Silverfur Partisan",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wolf", "Warrior"],
  power: 2,
  toughness: 2,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: {
        on: "becomes-target",
        who: "you-control",
        filter: { subtypes: ["Wolf", "Werewolf"] },
        spellFilter: { typesAnyOf: ["instant", "sorcery"] },
      },
      targets: [],
      effect: { kind: "create-token", token: "Wolf Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
