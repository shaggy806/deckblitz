/**
 * Amounts over objects' properties: chroma's mana symbols (`manaSymbolsOf`, an
 * aggregate's `of`, a `thisWay`'s `sumOf`, `ofAffected`), what a permanent
 * devoured (`devoured`, `self-devoured`), a commander's mana value on the
 * battlefield or in the command zone, and the greatest group sharing a creature
 * type (`aggregate: "greatest-shared-creature-type"`).
 */

import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  C,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickFromZone,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

const emptyHand = (game: Game, player: PlayerId): void => {
  for (const id of [...hand(game, player)]) game.debugMove(id, "library");
};

/** Fiery Bombardment's ability, paying with `victim`. */
const bombard = (game: Game, card: ObjectId, victim: ObjectId, at: PlayerId): void => {
  game.dispatch({
    type: "activate-ability",
    player: A,
    source: card,
    abilityIndex: 0,
    targets: [ref(at)],
    sacrifice: victim,
  } as Action);
  settle(game);
};

/** The object is `player`'s commander, wherever it is. */
const makeCommander = (game: Game, id: ObjectId): void => {
  game.state.objects[id].isCommander = true;
};

describe("chroma: mana symbols in a mana cost", () => {
  it("Fiery Bombardment reads the sacrificed creature's red symbols, hybrid included", () => {
    const { game } = table();
    const card = spawn(game, "Fiery Bombardment");
    // {5}{R}{R} and {R/W}{R/W}{R/W}.
    const dragon = spawn(game, "Shivan Hellkite");
    const reckoner = spawn(game, "Boros Reckoner");
    lands(game, "Mountain", 4);
    const before = life(game, B);
    bombard(game, card, dragon, B);
    expect(zone(game, dragon)).toBe("graveyard");
    expect(life(game, B)).toBe(before - 2);
    bombard(game, card, reckoner, B);
    expect(life(game, B)).toBe(before - 2 - 3);
  });

  it("Fiery Bombardment deals nothing for a creature with no red symbols", () => {
    const { game } = table();
    const card = spawn(game, "Fiery Bombardment");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 2);
    const before = life(game, B);
    bombard(game, card, bears, B);
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(before);
  });

  it("Light from Within counts each creature's own white symbols, a hybrid one once", () => {
    const { game } = table();
    spawn(game, "Light from Within");
    const lions = spawn(game, "Savannah Lions"); // {W}
    const angel = spawn(game, "Serra Angel"); // {3}{W}{W}
    const hybrid = spawn(game, "Kitchen Finks"); // {1}{G/W}{G/W}
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Serra Angel", B);
    expect(pt(game, lions)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, angel)).toEqual({ power: 6, toughness: 6 });
    expect(pt(game, hybrid)).toEqual({ power: 5, toughness: 4 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 4, toughness: 4 });
  });

  it("Umbra Stalker counts black symbols in its controller's graveyard, itself once it's there", () => {
    const { game } = table();
    const stalker = spawn(game, "Umbra Stalker");
    toGraveyard(game, "Doom Blade", A); // {1}{B}
    toGraveyard(game, "Phyrexian Rager", A); // {2}{B}
    toGraveyard(game, "Doom Blade", B);
    toGraveyard(game, "Grizzly Bears", A);
    expect(pt(game, stalker)).toEqual({ power: 2, toughness: 2 });
    toGraveyard(game, "Gray Merchant of Asphodel", A); // {3}{B}{B}
    expect(pt(game, stalker)).toEqual({ power: 4, toughness: 4 });
    game.debugMove(stalker, "graveyard");
    expect(pt(game, stalker)).toEqual({ power: 7, toughness: 7 });
  });

  it("Phosphorescent Feast counts only what's revealed", () => {
    const { game, a } = table();
    emptyHand(game, A);
    lands(game, "Forest", 5);
    const spell = toHand(game, "Phosphorescent Feast");
    const shown = toHand(game, "Llanowar Elves"); // {G}
    const shownToo = toHand(game, "Kitchen Finks"); // {1}{G/W}{G/W}
    toHand(game, "Craterhoof Behemoth"); // Kept back.
    const seen = pickFromZone(a, shown, shownToo);
    const before = life(game, A);
    cast(game, spell);
    expect(seen.offered).toHaveLength(3);
    expect(life(game, A)).toBe(before + 2 * 3);
    expect(zone(game, shown)).toBe("hand");
  });
});

describe("what a permanent devoured", () => {
  it("Marrow Chomper gains 2 life for each, whatever its multiplier made of the counters", () => {
    const { game, a } = table();
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Savannah Lions");
    lands(game, "Swamp", 3);
    lands(game, "Forest", 2);
    const chomper = toHand(game, "Marrow Chomper");
    pickPermanents(a, one, two);
    const before = life(game, A);
    cast(game, chomper);
    expect(counters(game, chomper)).toBe(4);
    expect(life(game, A)).toBe(before + 4);
    expect(graveyard(game, A)).toContain(one);
  });

  it("devouring nothing is a count of 0", () => {
    const { game, a } = table();
    spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 3);
    lands(game, "Forest", 2);
    const chomper = toHand(game, "Marrow Chomper");
    pickPermanents(a);
    const before = life(game, A);
    cast(game, chomper);
    expect(counters(game, chomper)).toBe(0);
    expect(life(game, A)).toBe(before);
  });

  it("Skullmulcher still draws for what it devoured after it has left (rule 608.2h)", () => {
    const { game, a } = table();
    const one = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 5);
    const skull = toHand(game, "Skullmulcher");
    pickPermanents(a, one);
    cast(game, skull, { settle: false });
    // Resolve the creature spell; its enters trigger waits on the stack.
    game.advanceUntil((s) => s.zones.shared.stack.length === 1 && s.objects[skull].zone === "battlefield");
    const before = hand(game, A).length;
    game.debugMove(skull, "graveyard");
    settle(game);
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("Hellkite Hatchling has flying and trample only if it devoured, and keeps them without counters", () => {
    const { game, a } = table();
    const one = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 2);
    lands(game, "Forest", 2);
    const hatchling = toHand(game, "Hellkite Hatchling");
    pickPermanents(a, one);
    cast(game, hatchling);
    expect(keywords(game, hatchling).has("flying")).toBe(true);
    expect(keywords(game, hatchling).has("trample")).toBe(true);
    game.state.objects[hatchling].counters = {};
    expect(keywords(game, hatchling).has("flying")).toBe(true);
  });

  it("Hellkite Hatchling that devoured nothing has neither", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    lands(game, "Forest", 2);
    const hatchling = toHand(game, "Hellkite Hatchling");
    pickPermanents(a);
    cast(game, hatchling);
    expect(keywords(game, hatchling).has("flying")).toBe(false);
  });

  it("Voracious Dragon counts the Goblins among them, a changeling too", () => {
    const { game, a } = table();
    const goblin = spawn(game, "Raging Goblin");
    const changeling = spawn(game, "Mirror Entity");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 5);
    const dragon = toHand(game, "Voracious Dragon");
    pickPermanents(a, goblin, changeling, bears);
    pickTargets(a, B);
    const before = life(game, B);
    cast(game, dragon);
    expect(counters(game, dragon)).toBe(3);
    expect(life(game, B)).toBe(before - 4);
  });

  it("Voracious Dragon reads a devoured token as it last was, though it has ceased to exist", () => {
    const { game, a } = table();
    const token = spawn(game, "Goblin Token");
    lands(game, "Mountain", 5);
    const dragon = toHand(game, "Voracious Dragon");
    pickPermanents(a, token);
    pickTargets(a, B);
    const before = life(game, B);
    cast(game, dragon);
    expect(counters(game, dragon)).toBe(1);
    expect(life(game, B)).toBe(before - 2);
  });

  it("a permanent that comes back has devoured nothing this time", () => {
    const { game, a } = table();
    const one = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 2);
    lands(game, "Forest", 2);
    const hatchling = toHand(game, "Hellkite Hatchling");
    pickPermanents(a, one);
    cast(game, hatchling);
    expect(keywords(game, hatchling).has("flying")).toBe(true);
    game.debugMove(hatchling, "graveyard");
    expect(game.state.objects[hatchling].enteredDevoured).toBeUndefined();
    pickPermanents(a);
    game.debugMove(hatchling, "battlefield");
    settle(game);
    expect(keywords(game, hatchling).has("flying")).toBe(false);
  });

  it("Tar Fiend makes the target discard for each", () => {
    const { game, a } = table();
    emptyHand(game, B);
    toHand(game, "Grizzly Bears", B);
    toHand(game, "Grizzly Bears", B);
    toHand(game, "Grizzly Bears", B);
    const one = spawn(game, "Savannah Lions");
    lands(game, "Swamp", 6);
    const fiend = toHand(game, "Tar Fiend");
    pickPermanents(a, one);
    pickTargets(a, B);
    cast(game, fiend);
    expect(counters(game, fiend)).toBe(2);
    expect(hand(game, B).length).toBe(2);
  });
});

describe("a commander's mana value on the battlefield or in the command zone", () => {
  it("Cloudkill reads the greatest of them, and not one in a graveyard", () => {
    const { game } = table();
    const big = spawn(game, "Serra Angel", B);
    const small = spawn(game, "Grizzly Bears");
    const commander = spawn(game, "Grizzly Bears");
    makeCommander(game, commander);
    const buried = toGraveyard(game, "Craterhoof Behemoth");
    makeCommander(game, buried);
    lands(game, "Swamp", 6);
    const spell = toHand(game, "Cloudkill");
    cast(game, spell);
    // X is 2: the Bears die, the Angel survives as a 2/2 until end of turn.
    expect(zone(game, small)).toBe("graveyard");
    expect(zone(game, commander)).toBe("command");
    expect(pt(game, big)).toEqual({ power: 2, toughness: 2 });
  });

  it("Cloudkill reads a commander in the command zone, or owned but controlled by someone else (the ruling)", () => {
    const { game } = table();
    const stolen = spawn(game, "Serra Angel");
    game.state.objects[stolen].controller = B;
    makeCommander(game, stolen);
    const victim = spawn(game, "Craterhoof Behemoth", B);
    lands(game, "Swamp", 6);
    cast(game, toHand(game, "Cloudkill"));
    expect(zone(game, victim)).toBe("graveyard");
  });

  it("Cloudkill reads a commander in the command zone", () => {
    const { game } = table();
    const away = spawn(game, "Serra Angel");
    makeCommander(game, away);
    game.debugMove(away, "command");
    const victim = spawn(game, "Craterhoof Behemoth", B);
    lands(game, "Swamp", 6);
    cast(game, toHand(game, "Cloudkill"));
    expect(zone(game, victim)).toBe("graveyard");
  });

  it("Imposing Grandeur: each player who says yes draws by their own commander", () => {
    const { game, a, b } = table({ players: 3 });
    for (const p of [A, B, C]) emptyHand(game, p);
    makeCommander(game, spawn(game, "Grizzly Bears", A));
    makeCommander(game, spawn(game, "Serra Angel", B));
    lands(game, "Mountain", 5);
    pickModes(a, 0);
    pickModes(b, 0);
    toHand(game, "Grizzly Bears", B);
    toHand(game, "Grizzly Bears", C);
    cast(game, toHand(game, "Imposing Grandeur"));
    expect(hand(game, A).length).toBe(2);
    expect(hand(game, B).length).toBe(5);
    // Carol said no by default: her hand stays, and she has no commander anyway.
    expect(hand(game, C).length).toBe(1);
  });

  it("Stinging Study asks which commander only when their mana values differ", () => {
    const { game, a } = table();
    emptyHand(game, A);
    makeCommander(game, spawn(game, "Grizzly Bears"));
    makeCommander(game, spawn(game, "Serra Angel"));
    lands(game, "Swamp", 5);
    let offered: readonly string[] = [];
    a.chooseCreatureTypeFn = (_v, _s, options) => {
      offered = options;
      return "Serra Angel";
    };
    const before = life(game, A);
    cast(game, toHand(game, "Stinging Study"));
    expect(offered).toEqual(["Grizzly Bears", "Serra Angel"]);
    expect(hand(game, A).length).toBe(5);
    expect(life(game, A)).toBe(before - 5);
  });

  it("Stinging Study asks nothing with one commander, and is X = 0 with none", () => {
    const { game, a } = table();
    emptyHand(game, A);
    lands(game, "Swamp", 10);
    let asked = false;
    a.chooseCreatureTypeFn = (_v, _s, options) => {
      asked = true;
      return options[0];
    };
    const before = life(game, A);
    cast(game, toHand(game, "Stinging Study"));
    expect(hand(game, A).length).toBe(0);
    expect(life(game, A)).toBe(before);
    makeCommander(game, spawn(game, "Grizzly Bears"));
    cast(game, toHand(game, "Stinging Study"));
    expect(asked).toBe(false);
    expect(hand(game, A).length).toBe(2);
    expect(life(game, A)).toBe(before - 2);
  });

  it("Visions of Dominance puts a counter on, then doubles", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 3);
    pickTargets(a, bears);
    cast(game, toHand(game, "Visions of Dominance"), { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(2);
  });
});

describe("the greatest group sharing a creature type", () => {
  it("Basalt Ravager counts itself and the largest group, not a total of types", () => {
    const { game, a } = table();
    spawn(game, "Grizzly Bears"); // Bear
    spawn(game, "Goblin Wizard"); // Goblin Wizard
    spawn(game, "Sage of Fables"); // Merfolk Wizard
    spawn(game, "Serra Angel", B); // Not yours.
    pickTargets(a, B);
    const before = life(game, B);
    enter(game, "Basalt Ravager");
    // Wizards: the Goblin, the Merfolk and the Ravager itself.
    expect(life(game, B)).toBe(before - 3);
  });

  it("a changeling is in every group, a typeless creature in none", () => {
    const { game, a } = table();
    spawn(game, "Mirror Entity"); // Changeling
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    pickTargets(a, B);
    const before = life(game, B);
    enter(game, "Basalt Ravager");
    expect(life(game, B)).toBe(before - 3);
  });

  it("a stack of tokens counts every token in it", () => {
    const { game, a } = table();
    game.state.objects[spawn(game, "Goblin Token")].stackCount = 3;
    pickModes(a, 1);
    const before = life(game, A);
    enter(game, "Skemfar Shadowsage");
    expect(life(game, A)).toBe(before + 3);
  });

  it("Skemfar Shadowsage's first mode drains each opponent", () => {
    const { game, a } = table({ players: 3 });
    spawn(game, "Llanowar Elves");
    pickModes(a, 0);
    const [before, beforeC] = [life(game, B), life(game, C)];
    enter(game, "Skemfar Shadowsage");
    expect(life(game, B)).toBe(before - 2);
    expect(life(game, C)).toBe(beforeC - 2);
  });

  it("White Lotus Tile enters tapped and adds the number in one color (its ruling's example)", () => {
    const { game } = table();
    const tile = spawn(game, "White Lotus Tile");
    expect(game.state.objects[tile].tapped).toBe(true);
    game.state.objects[tile].tapped = false;
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: tile,
      abilityIndex: 0,
      targets: [],
      manaColors: ["R"],
    } as Action);
    expect(game.state.players[A].manaPool.filter((unit) => unit.type === "R").length).toBe(3);
  });

  it("Synchronized Eviction costs {2} less with two creatures sharing a type, and puts it second from the top", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    lands(game, "Island", 3);
    const victim = spawn(game, "Serra Angel", B);
    cast(game, toHand(game, "Synchronized Eviction"), { targets: [ref(victim)] });
    expect(zone(game, victim)).toBe("library");
    expect(game.state.zones.perPlayer[B].library.indexOf(victim)).toBe(1);
  });

  it("Synchronized Eviction pays full with two creatures sharing nothing", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Savannah Lions");
    lands(game, "Island", 3);
    const victim = spawn(game, "Serra Angel", B);
    expect(() => cast(game, toHand(game, "Synchronized Eviction"), { targets: [ref(victim)] })).toThrow();
  });

  it("Shared Animosity counts other attackers sharing a type with each one", () => {
    const { game, a } = table();
    spawn(game, "Shared Animosity");
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    const three = spawn(game, "Grizzly Bears");
    const lion = spawn(game, "Savannah Lions");
    const before = life(game, B);
    attack(game, a, [one, two, three, lion]);
    // Each Bear: 2, and 1 for each of the two others. The Cat shares nothing.
    expect(life(game, B)).toBe(before - (4 + 4 + 4 + 2));
  });
});
