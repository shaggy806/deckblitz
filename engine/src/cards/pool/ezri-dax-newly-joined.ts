import { defineCard } from "../define.js";

export default defineCard({
  name: "Ezri Dax, Newly Joined",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Trill", "Advisor"],
  power: 2,
  toughness: 2,
  keywords: ["flash"],
  text:
    "Flash\nYou may have Ezri Dax enter as a copy of any creature card in your graveyard that was put there from the " +
    "battlefield this turn, except her name is Ezri Dax, Newly Joined and she's a legendary Trill in addition to her other types.",
  // A card in your graveyard is one you own (rule 404.2).
  copyOnEnter: {
    filter: { type: "creature", ownedBy: "you", putIntoGraveyardThisTurn: { from: ["battlefield"] } },
    from: "graveyards",
    except: { name: "Ezri Dax, Newly Joined", addSupertypes: ["legendary"], addSubtypes: ["Trill"] },
  },
});
