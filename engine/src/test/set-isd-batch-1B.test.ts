/**
 * Innistrad and Dark Ascension (ISD, DKA; B188) — group b: Séance's token
 * copies, Garruk Relentless's state-triggered transform, Warden of the Wall's
 * off-turn animation, morbid, fateful hour and Kruin Outlaw's werewolf lord.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { printedCardName } from "../state.js";

import {
  A,
  B,
  activate,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  named,
  nextTurn,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  types,
  zone,
} from "./harness.js";

const faceOf = (game: Game, id: ObjectId): string => printedCardName(game.state.objects[id]);
const onBattlefield = (game: Game, name: string, player = A): ObjectId[] =>
  named(game, name, player).filter((id) => zone(game, id) === "battlefield");

describe("Séance", () => {
  it("exiles the card on an opponent's upkeep for a Spirit token copy that's exiled at that end step", () => {
    const { game, a } = table();
    spawn(game, "Séance");
    const bears = toGraveyard(game, "Grizzly Bears");
    pickTargets(a, bears);
    pickModes(a, 0);
    nextTurn(game); // bob's turn: the upkeep trigger resolved
    expect(zone(game, bears)).toBe("exile");
    const [token] = onBattlefield(game, "Grizzly Bears");
    expect(token).toBeDefined();
    expect(game.state.objects[token].isToken).toBe(true);
    expect(subtypes(game, token)).toEqual(expect.arrayContaining(["Bear", "Spirit"]));
    expect(pt(game, token)).toEqual({ power: 2, toughness: 2 });
    nextTurn(game); // past bob's end step
    expect(onBattlefield(game, "Grizzly Bears")).toHaveLength(0);
  });

  it("does nothing when declined", () => {
    const { game, a } = table();
    spawn(game, "Séance");
    const bears = toGraveyard(game, "Grizzly Bears");
    pickTargets(a, bears);
    pickModes(a);
    nextTurn(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(onBattlefield(game, "Grizzly Bears")).toHaveLength(0);
  });
});

describe("Forge Devil", () => {
  it("deals 1 damage to the target creature and 1 to you", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    enter(game, "Forge Devil");
    expect(game.state.objects[bears].damageMarked).toBe(1);
    expect(life(game, A)).toBe(19);
  });
});

describe("Gravetiller Wurm", () => {
  it("enters with four +1/+1 counters only if a creature died this turn", () => {
    const { game } = table();
    const plain = enter(game, "Gravetiller Wurm");
    expect(counters(game, plain)).toBe(0);
    destroy(game, spawn(game, "Grizzly Bears", B));
    const morbid = enter(game, "Gravetiller Wurm");
    expect(counters(game, morbid)).toBe(4);
    expect(pt(game, morbid)).toEqual({ power: 8, toughness: 8 });
  });
});

describe("Warden of the Wall", () => {
  it("enters tapped and is a 2/3 flying Gargoyle creature only on other players' turns", () => {
    const { game } = table();
    const warden = enter(game, "Warden of the Wall");
    expect(game.state.objects[warden].tapped).toBe(true);
    expect(types(game, warden)).not.toContain("creature");
    nextTurn(game);
    expect(types(game, warden)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(subtypes(game, warden)).toContain("Gargoyle");
    expect(pt(game, warden)).toEqual({ power: 2, toughness: 3 });
    expect(keywords(game, warden).has("flying")).toBe(true);
  });
});

describe("Talons of Falkenrath", () => {
  it("gives the enchanted creature a {1}{R} +2/+0 pump", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    cast(game, toHand(game, "Talons of Falkenrath"), { targets: [ref(bears)] });
    activate(game, bears, 0);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
  });
});

describe("Village Survivors", () => {
  it("gives other creatures vigilance only at 5 or less life", () => {
    const { game } = table();
    spawn(game, "Village Survivors");
    const bears = spawn(game, "Grizzly Bears");
    game.state.players[A].life = 6;
    expect(keywords(game, bears).has("vigilance")).toBe(false);
    game.state.players[A].life = 5;
    expect(keywords(game, bears).has("vigilance")).toBe(true);
  });
});

describe("Geist-Honored Monk", () => {
  it("makes two Spirits and counts every creature you control, itself included", () => {
    const { game } = table();
    const monk = enter(game, "Geist-Honored Monk");
    expect(onBattlefield(game, "Spirit Token")).toHaveLength(2);
    expect(pt(game, monk)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Kruin Outlaw // Terror of Kruin Pass", () => {
  it("transforms after a turn with no spells, and the back face gives Werewolves menace", () => {
    const { game } = table();
    const outlaw = spawn(game, "Kruin Outlaw");
    const ranger = spawn(game, "Daybreak Ranger");
    const bears = spawn(game, "Grizzly Bears");
    expect(keywords(game, outlaw).has("first-strike")).toBe(true);
    nextTurn(game);
    expect(faceOf(game, outlaw)).toBe("Terror of Kruin Pass");
    expect(keywords(game, outlaw).has("double-strike")).toBe(true);
    expect(keywords(game, outlaw).has("menace")).toBe(true);
    expect(keywords(game, ranger).has("menace")).toBe(true);
    expect(keywords(game, bears).has("menace")).toBe(false);
  });
});

describe("Garruk Relentless // Garruk, the Veil-Cursed", () => {
  it("fights for 3, takes the creature's power back, and transforms at two or fewer loyalty", () => {
    const { game, a } = table();
    const garruk = spawn(game, "Garruk Relentless");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    loyalty(game, garruk, 0, { atLeast: 3, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[garruk].counters.loyalty).toBe(1);
    expect(faceOf(game, garruk)).toBe("Garruk, the Veil-Cursed");
  });

  it("doesn't transform while it has three or more loyalty", () => {
    const { game } = table();
    const garruk = spawn(game, "Garruk Relentless");
    const wolfIndex = 1;
    game.state.objects[garruk].counters.loyalty = 3;
    activate(game, garruk, wolfIndex);
    expect(onBattlefield(game, "Wolf Token")).toHaveLength(1);
    expect(faceOf(game, garruk)).toBe("Garruk Relentless");
  });

  it("−1 sacrifices a creature to tutor one; −3 pumps by the creature cards in the graveyard as it resolves", () => {
    const { game, a } = table();
    const garruk = spawn(game, "Garruk Relentless");
    game.state.objects[garruk].counters.loyalty = 2;
    nextTurn(game); // the state trigger transformed it already; bob's turn
    expect(faceOf(game, garruk)).toBe("Garruk, the Veil-Cursed");
    nextTurn(game); // alice's turn 3
    const fodder = spawn(game, "Grizzly Bears");
    const target = toLibrary(game, "Grizzly Bears");
    pickFromZone(a, target);
    const before = hand(game).length;
    // The harness's `loyalty` reads the front face's abilities: the back's by index.
    game.state.objects[garruk].counters.loyalty = 3;
    activate(game, garruk, 1);
    expect(zone(game, fodder)).toBe("graveyard");
    expect(zone(game, target)).toBe("hand");
    expect(hand(game).length).toBe(before + 1);

    nextTurn(game);
    nextTurn(game); // alice's turn 5: a fresh loyalty activation
    toGraveyard(game, "Grizzly Bears");
    const wolf = spawn(game, "Grizzly Bears");
    game.state.objects[garruk].counters.loyalty = 3;
    activate(game, garruk, 2);
    expect(graveyard(game).filter((id) => game.state.objects[id].cardName === "Grizzly Bears")).toHaveLength(2);
    expect(pt(game, wolf)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, wolf).has("trample")).toBe(true);
    toGraveyard(game, "Grizzly Bears");
    expect(pt(game, wolf)).toEqual({ power: 4, toughness: 4 });
  });

  it("+1 makes a 1/1 black deathtouch Wolf", () => {
    const { game } = table();
    const garruk = spawn(game, "Garruk Relentless");
    game.state.objects[garruk].counters.loyalty = 2;
    nextTurn(game);
    nextTurn(game);
    activate(game, garruk, 0);
    const [wolf] = onBattlefield(game, "Black Wolf Token (Deathtouch)");
    expect(pt(game, wolf)).toEqual({ power: 1, toughness: 1 });
    expect(keywords(game, wolf).has("deathtouch")).toBe(true);
  });
});

describe("Demonmail Hauberk", () => {
  it("equips by sacrificing a creature and gives +4/+2", () => {
    const { game } = table();
    const hauberk = spawn(game, "Demonmail Hauberk");
    const bears = spawn(game, "Grizzly Bears");
    const fodder = spawn(game, "Grizzly Bears");
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: hauberk,
      abilityIndex: 0,
      targets: [ref(bears)],
      sacrifice: fodder,
    });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(zone(game, fodder)).toBe("graveyard");
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 4 });
  });
});

describe("Gnaw to the Bone", () => {
  it("gains 2 life per creature card in your graveyard", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Gnaw to the Bone"));
    expect(life(game, A)).toBe(24);
  });
});

describe("Ghoulraiser", () => {
  it("returns a Zombie card from your graveyard, never another card", () => {
    const { game } = table();
    const zombie = toGraveyard(game, "Ghoulraiser");
    const bears = toGraveyard(game, "Grizzly Bears");
    enter(game, "Ghoulraiser");
    expect(zone(game, zombie)).toBe("hand");
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Brimstone Volley", () => {
  it("deals 3, or 5 if a creature died this turn", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    cast(game, toHand(game, "Brimstone Volley"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    destroy(game, spawn(game, "Grizzly Bears", B));
    cast(game, toHand(game, "Brimstone Volley"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(12);
  });
});
