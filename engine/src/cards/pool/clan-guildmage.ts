import { defineCard } from "../define.js";

// EDHREC rank 24255. The animated land isn't untapped (the ruling).

const CANT_BLOCK_TEXT = "{1}{R}, {T}: Target creature can't block this turn.";
const ANIMATE_TEXT =
  "{2}{G}, {T}: Target land you control becomes a 4/4 Elemental creature with haste until end of turn. It's still a land.";

export default defineCard({
  name: "Clan Guildmage",
  manaCost: "{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 2,
  toughness: 2,
  text: `${CANT_BLOCK_TEXT}\n${ANIMATE_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{R}", tap: true },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      resolve: null,
      text: CANT_BLOCK_TEXT,
    },
    {
      cost: { mana: "{2}{G}", tap: true },
      targets: ["land-you-control"],
      effect: {
        kind: "animate",
        target: 0,
        power: 4,
        toughness: 4,
        addTypes: ["creature"],
        addSubtypes: ["Elemental"],
        keywords: ["haste"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
  ],
});
