import { defineCard } from "../define.js";

// EDHREC rank 8161. "Cast it from your graveyard as an Adventure": a
// permission over the card that died (rule 400.7: the card now in the
// graveyard), whose `spell` filter is judged as the face cast (601.3e) —
// only the Adventure face, Dread Whispers, is a spell of subtype Adventure
// (715.3a). It resolves into exile on an adventure like any other (715.3d),
// whichever zone it was cast from.

const DIES = "When this creature dies, you may cast it from your graveyard as an Adventure until the end of your next turn.";

export default defineCard({
  name: "Mosswood Dreadknight",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 2,
  keywords: ["trample"],
  text: `Trample\n${DIES}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "grant-play",
        cards: "trigger-object",
        duration: "until-end-of-your-next-turn",
        spell: { subtype: "Adventure" },
      },
      resolve: null,
      text: DIES,
    },
  ],
  faces: ["Mosswood Dreadknight", "Dread Whispers"],
  adventure: true,
});
