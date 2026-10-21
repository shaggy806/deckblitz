import { defineCard } from "../define.js";

// EDHREC rank 26435.

const UNTAP_TEXT = "You may choose not to untap this creature during your untap step.";

export default defineCard({
  name: "Hedge Whisperer",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Druid", "Detective"],
  power: 0,
  toughness: 3,
  text: "You may choose not to untap this creature during your untap step.\n{3}{G}, {T}, Collect evidence 4: Target land you control becomes a 5/5 green Plant Boar creature with haste for as long as this creature remains tapped. It's still a land. Activate only as a sorcery. (To collect evidence 4, exile cards with total mana value 4 or greater from your graveyard.)",
  static: [{ affects: { scope: "self" }, mayChooseNotToUntap: true, text: UNTAP_TEXT }],
  activated: [
    {
      cost: { mana: "{3}{G}", tap: true, collectEvidence: 4 },
      targets: ["land-you-control"],
      effect: {
        kind: "animate",
        target: 0,
        power: 5,
        toughness: 5,
        addTypes: ["creature"],
        addSubtypes: ["Plant", "Boar"],
        setColors: ["G"],
        keywords: ["haste"],
        duration: "while-source-tapped",
      },
      sorcerySpeed: true,
      resolve: null,
      text: "{3}{G}, {T}, Collect evidence 4: Target land you control becomes a 5/5 green Plant Boar creature with haste for as long as this creature remains tapped. It's still a land. Activate only as a sorcery. (To collect evidence 4, exile cards with total mana value 4 or greater from your graveyard.)",
    },
  ],
});
