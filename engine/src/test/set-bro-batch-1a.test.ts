/**
 * The set walk, The Brothers' War batch 1, group a (2026-10-19). Written on
 * the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
  activate,
  cast,
  controller,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  toStep,
  nextTurn,
  types,
  zone,
} from "./harness.js";

const canCast = (game: Game, card: ObjectId, player: PlayerId = A): boolean =>
  game.legalActions(player).some((x) => x.kind === "cast-spell" && x.card === card);
const pool = (game: Game, player: PlayerId = A): string[] => game.state.players[player].manaPool.map((u) => u.type);
const exile = (game: Game, id: ObjectId, by: PlayerId = B): void => {
  game.debugApplyEffect(by, { kind: "exile", target: 0 }, [ref(id)]);
  settle(game);
};

describe("Overwhelming Remorse", () => {
  it("costs {1} less per creature card in your graveyard, never below {B}, and exiles", () => {
    const { game } = table();
    const remorse = toHand(game, "Overwhelming Remorse");
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Swamp", 1);
    for (let i = 0; i < 3; i++) toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Sol Ring");
    toGraveyard(game, "Grizzly Bears", B);
    // {4}{B} less three: {1}{B} — one Swamp short.
    expect(canCast(game, remorse)).toBe(false);
    for (let i = 0; i < 3; i++) toGraveyard(game, "Grizzly Bears");
    // Six off {4}{B}: still {B}.
    expect(canCast(game, remorse)).toBe(true);
    cast(game, remorse, { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("exile");
  });
});

describe("Teething Wurmlet", () => {
  it("has deathtouch with three artifacts, and gains life per artifact but grows only once a turn", () => {
    const { game } = table();
    const wurm = spawn(game, "Teething Wurmlet");
    enter(game, "Sol Ring");
    expect(life(game)).toBe(21);
    expect(counters(game, wurm)).toBe(1);
    enter(game, "Mind Stone");
    expect(life(game)).toBe(22);
    expect(counters(game, wurm)).toBe(1);
    expect(keywords(game, wurm).has("deathtouch")).toBe(false);
    enter(game, "Ornithopter");
    expect(keywords(game, wurm).has("deathtouch")).toBe(true);
    // An opponent's artifact doesn't count.
    enter(game, "Sol Ring", B);
    expect(life(game)).toBe(23);
  });
});

describe("Symmetry Matrix", () => {
  it("offers a {1} draw only for a creature whose power equals its toughness", () => {
    const { game, a } = table();
    spawn(game, "Symmetry Matrix");
    lands(game, "Wastes", 2);
    pickModes(a, 0);
    const before = hand(game).length;
    enter(game, "Ornithopter"); // 0/2
    expect(hand(game).length).toBe(before);
    enter(game, "Grizzly Bears"); // 2/2
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Mishra's Foundry", () => {
  it("becomes a 2/2 Assembly-Worker artifact creature land", () => {
    const { game } = table();
    const foundry = spawn(game, "Mishra's Foundry");
    lands(game, "Wastes", 2);
    activate(game, foundry, 1);
    expect(pt(game, foundry)).toEqual({ power: 2, toughness: 2 });
    expect(types(game, foundry)).toEqual(expect.arrayContaining(["land", "artifact", "creature"]));
    expect(subtypes(game, foundry)).toContain("Assembly-Worker");
  });

  it("pumps an attacking Assembly-Worker, and not one that isn't attacking", () => {
    const { game, a } = table();
    const factory = spawn(game, "Mishra's Factory");
    const idle = spawn(game, "Mishra's Factory");
    const foundry = spawn(game, "Mishra's Foundry");
    lands(game, "Wastes", 1);
    for (const id of [factory, idle]) {
      game.debugApplyEffect(
        A,
        {
          kind: "animate",
          target: 0,
          power: 2,
          toughness: 2,
          addTypes: ["artifact", "creature"],
          addSubtypes: ["Assembly-Worker"],
          duration: "end-of-turn",
        },
        [ref(id)],
      );
    }
    a.declareAttackersFn = () => [{ attacker: factory, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.priority.holder === A && s.awaiting === null);
    expect(game.state.objects[factory].tapped).toBe(true);
    expect(() => activate(game, foundry, 2, { targets: [ref(idle)] })).toThrow();
    activate(game, foundry, 2, { targets: [ref(factory)] });
    expect(pt(game, factory)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Ashnod's Intervention", () => {
  it("gives +2/+0 and returns the creature to hand when it dies", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Ashnod's Intervention"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    destroy(game, bears);
    expect(zone(game, bears)).toBe("hand");
  });

  it("returns it to hand when it's exiled from the battlefield", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Ashnod's Intervention"), { targets: [ref(bears)] });
    exile(game, bears, A);
    expect(zone(game, bears)).toBe("hand");
    expect(hand(game, B)).toContain(bears);
  });
});

describe("Cradle Clearcutter", () => {
  it("prototyped is a 1/3 tapping for {G}; the full 3/6 taps for {G}{G}{G}", () => {
    const { game } = table();
    const proto = toHand(game, "Cradle Clearcutter");
    lands(game, "Forest", 3);
    cast(game, proto, { prototype: true });
    expect(pt(game, proto)).toEqual({ power: 1, toughness: 3 });
    const big = spawn(game, "Cradle Clearcutter");
    activate(game, big, 0);
    expect(pool(game)).toEqual(["G", "G", "G"]);
  });
});

describe("Phyrexian Dragon Engine", () => {
  it("unearthed, it may wheel your hand for three", () => {
    const { game, a } = table();
    const engine = toGraveyard(game, "Phyrexian Dragon Engine");
    lands(game, "Mountain", 5);
    toHand(game, "Grizzly Bears");
    const kept = [...hand(game)];
    pickModes(a, 0);
    activate(game, engine, 0);
    expect(zone(game, engine)).toBe("battlefield");
    expect(keywords(game, engine).has("haste")).toBe(true);
    expect(keywords(game, engine).has("double-strike")).toBe(true);
    for (const id of kept) expect(zone(game, id)).toBe("graveyard");
    expect(hand(game)).toHaveLength(3);
  });

  it("cast from hand, it doesn't trigger", () => {
    const { game, a } = table();
    const engine = toHand(game, "Phyrexian Dragon Engine");
    lands(game, "Wastes", 3);
    pickModes(a, 0);
    const before = hand(game).length;
    cast(game, engine);
    expect(zone(game, engine)).toBe("battlefield");
    expect(hand(game).length).toBe(before - 1);
  });
});

describe("Slagstone Refinery", () => {
  it("makes a tapped Powerstone for itself or another nontoken artifact going to a graveyard or exile", () => {
    const { game } = table();
    const refinery = spawn(game, "Slagstone Refinery");
    destroy(game, spawn(game, "Sol Ring"));
    expect(tokensNamed(game, "Powerstone Token", A)).toBe(1);
    expect(game.state.objects[named(game, "Powerstone Token", A)[0]].tapped).toBe(true);
    exile(game, spawn(game, "Mind Stone"));
    expect(tokensNamed(game, "Powerstone Token", A)).toBe(2);
    // A token artifact doesn't count.
    game.debugApplyEffect(A, { kind: "create-token", token: "Treasure Token", count: 1 }, []);
    const treasure = named(game, "Treasure Token", A)[0];
    expect(game.state.objects[treasure].isToken).toBe(true);
    destroy(game, treasure);
    expect(tokensNamed(game, "Powerstone Token", A)).toBe(2);
    // An opponent's artifact doesn't either.
    destroy(game, spawn(game, "Sol Ring", B));
    expect(tokensNamed(game, "Powerstone Token")).toBe(2);
    destroy(game, refinery);
    expect(tokensNamed(game, "Powerstone Token", A)).toBe(3);
  });
});

describe("Union of the Third Path", () => {
  it("draws, then gains life equal to the hand after the draw", () => {
    const { game } = table();
    const union = toHand(game, "Union of the Third Path");
    lands(game, "Plains", 3);
    const before = hand(game).length;
    cast(game, union);
    expect(hand(game).length).toBe(before);
    expect(life(game)).toBe(20 + before);
  });
});

describe("Urza's Rebuff", () => {
  it("counters a spell, or taps up to two creatures", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const x = spawn(game, "Grizzly Bears", B);
    const y = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Urza's Rebuff"), { modes: [1], targets: [ref(x), ref(y)] });
    expect(game.state.objects[x].tapped).toBe(true);
    expect(game.state.objects[y].tapped).toBe(true);
  });

  it("counters target spell", () => {
    const { game } = table();
    lands(game, "Island", 3);
    lands(game, "Mountain", 1);
    const bolt = toHand(game, "Lightning Bolt");
    // Alice holds priority after casting, and answers her own spell.
    cast(game, bolt, { targets: [ref(B)], settle: false });
    cast(game, toHand(game, "Urza's Rebuff"), { modes: [0], targets: [ref(bolt)] });
    expect(zone(game, bolt)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });
});

describe("Su-Chi Cave Guard", () => {
  it("dies into eight {C} that last through the turn's steps", () => {
    const { game } = table();
    const guard = spawn(game, "Su-Chi Cave Guard");
    expect(keywords(game, guard).has("vigilance")).toBe(true);
    destroy(game, guard);
    expect(pool(game)).toEqual(Array(8).fill("C"));
    const step = game.state.turn.step;
    game.advanceUntil((s) => s.turn.step !== step);
    expect(game.state.turn.number).toBe(1);
    expect(pool(game)).toHaveLength(8);
    nextTurn(game);
    expect(pool(game)).toHaveLength(0);
  });
});

describe("Urza's Command", () => {
  it("shrinks your opponents' creatures and makes a tapped Powerstone", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const giant = spawn(game, "Hill Giant", B);
    const mine = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Urza's Command"), { modes: [0, 1] });
    expect(pt(game, giant)).toEqual({ power: 1, toughness: 3 });
    expect(pt(game, mine)).toEqual({ power: 2, toughness: 2 });
    expect(tokensNamed(game, "Powerstone Token", A)).toBe(1);
  });

  it("makes a tapped Construct that counts itself among your artifacts", () => {
    const { game } = table();
    lands(game, "Island", 4);
    cast(game, toHand(game, "Urza's Command"), { modes: [1, 2] });
    const construct = named(game, "Construct Token", A)[0];
    expect(game.state.objects[construct].tapped).toBe(true);
    expect(pt(game, construct)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Fateful Handoff", () => {
  it("draws the permanent's mana value, then an opponent gains control of it", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const giant = spawn(game, "Hill Giant");
    const handoff = toHand(game, "Fateful Handoff");
    const before = hand(game).length;
    cast(game, handoff, { targets: [ref(giant)] });
    // Hill Giant is {3}{R}: four cards.
    expect(hand(game).length).toBe(before - 1 + 4);
    expect(controller(game, giant)).toBe(B);
  });
});

describe("Calamity's Wake", () => {
  it("exiles every graveyard and itself, and stops noncreature spells for the turn", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    lands(game, "Forest", 4);
    const mine = toGraveyard(game, "Grizzly Bears");
    const theirs = toGraveyard(game, "Hill Giant", B);
    const wake = toHand(game, "Calamity's Wake");
    cast(game, wake);
    expect(zone(game, mine)).toBe("exile");
    expect(zone(game, theirs)).toBe("exile");
    expect(zone(game, wake)).toBe("exile");
    expect(graveyard(game)).toHaveLength(0);
    expect(canCast(game, toHand(game, "Sol Ring"))).toBe(false);
    expect(canCast(game, toHand(game, "Grizzly Bears"))).toBe(true);
  });
});

describe("Thran Spider", () => {
  it("gives you and target opponent a tapped Powerstone each, and digs four for an artifact", () => {
    const { game, a } = table();
    pickTargets(a, B);
    const spider = enter(game, "Thran Spider");
    expect(tokensNamed(game, "Powerstone Token", A)).toBe(1);
    expect(tokensNamed(game, "Powerstone Token", B)).toBe(1);
    expect(game.state.objects[named(game, "Powerstone Token", B)[0]].tapped).toBe(true);
    const ring = toLibrary(game, "Sol Ring");
    lands(game, "Wastes", 7);
    pickFromZone(a, ring);
    activate(game, spider, 0);
    expect(zone(game, ring)).toBe("hand");
  });
});

describe("Platoon Dispenser", () => {
  it("draws at your end step only with two other creatures, and makes Soldiers", () => {
    const { game } = table();
    const dispenser = spawn(game, "Platoon Dispenser");
    lands(game, "Plains", 4);
    activate(game, dispenser, 0);
    expect(tokensNamed(game, "Soldier Artifact Token", A)).toBe(1);
    const before = hand(game).length;
    toStep(game, "end");
    settle(game);
    expect(hand(game).length).toBe(before);
    nextTurn(game);
    nextTurn(game);
    spawn(game, "Grizzly Bears");
    const now = hand(game).length;
    toStep(game, "end");
    settle(game);
    expect(hand(game).length).toBe(now + 1);
  });
});

describe("Gruesome Realization", () => {
  it("draws two for 2 life, or shrinks your opponents' creatures", () => {
    const { game } = table();
    lands(game, "Swamp", 6);
    const before = hand(game).length;
    cast(game, toHand(game, "Gruesome Realization"), { modes: [0] });
    expect(hand(game).length).toBe(before + 2);
    expect(life(game)).toBe(18);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Gruesome Realization"), { modes: [1] });
    expect(pt(game, giant)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Deathbloom Ritualist", () => {
  it("taps for X mana of one color, X the creature cards in your graveyard", () => {
    const { game } = table();
    const ritualist = spawn(game, "Deathbloom Ritualist");
    for (let i = 0; i < 3; i++) toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Sol Ring");
    toGraveyard(game, "Hill Giant", B);
    game.dispatch({ type: "activate-ability", player: A, source: ritualist, abilityIndex: 0, targets: [], manaColors: ["B"] });
    settle(game);
    expect(pool(game)).toEqual(["B", "B", "B"]);
  });
});

describe("Lay Down Arms", () => {
  it("exiles a creature of mana value up to your Plains count, and its controller gains 3", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const arms = toHand(game, "Lay Down Arms");
    expect(() => cast(game, arms, { targets: [ref(giant)] })).toThrow();
    cast(game, arms, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    expect(life(game, B)).toBe(23);
  });
});

describe("Transmogrant Altar", () => {
  it("sacrifices a creature for {C}{C}{C}, or for a 3/3 Zombie artifact at sorcery speed", () => {
    const { game } = table();
    const altar = spawn(game, "Transmogrant Altar");
    lands(game, "Swamp", 1);
    const bears = spawn(game, "Grizzly Bears");
    game.dispatch({ type: "activate-ability", player: A, source: altar, abilityIndex: 0, targets: [], sacrifice: bears });
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(pool(game)).toEqual(["C", "C", "C"]);
    game.state.players[A].manaPool = [];

    nextTurn(game);
    nextTurn(game);
    lands(game, "Wastes", 2);
    const giant = spawn(game, "Hill Giant");
    game.dispatch({ type: "activate-ability", player: A, source: altar, abilityIndex: 1, targets: [], sacrifice: giant });
    settle(game);
    expect(zone(game, giant)).toBe("graveyard");
    const zombie = named(game, "Zombie Token (Transmogrant Altar)", A)[0];
    expect(pt(game, zombie)).toEqual({ power: 3, toughness: 3 });
    expect(types(game, zombie)).toEqual(expect.arrayContaining(["artifact", "creature"]));
  });
});
