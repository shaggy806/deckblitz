/**
 * The set walk, The Brothers' War batch 1, part c (2026-10-19). Written on the
 * shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import { createDefaultRegistry } from "../cards/registry.js";
import { ScriptedController } from "../controller.js";
import { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  blockOffer,
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
  nextTurn,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

const canCast = (game: Game, card: ObjectId, player: PlayerId = A): boolean =>
  game.legalActions(player).some((x) => x.kind === "cast-spell" && x.card === card);
const canActivate = (game: Game, source: ObjectId, index: number, player: PlayerId = A): boolean =>
  game.legalActions(player).some((x) => x.kind === "activate-ability" && x.source === source && x.abilityIndex === index);
const colorsOf = (game: Game, id: ObjectId): string[] => [...game.characteristics(id).colors];
const damage = (game: Game, id: ObjectId, amount: number): void => {
  game.debugApplyEffect(B, { kind: "damage", amount, target: 0 }, [ref(id)]);
  settle(game);
};
const isTapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;

describe("Scatter Ray", () => {
  it("counters an artifact or creature spell whose controller can't pay {4}", () => {
    const { game } = table();
    lands(game, "Island", 2);
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    cast(game, toHand(game, "Scatter Ray"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("can't target an instant", () => {
    const { game } = table();
    lands(game, "Island", 2);
    lands(game, "Mountain", 1);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { settle: false, targets: [ref(B)] });
    expect(() => cast(game, toHand(game, "Scatter Ray"), { targets: [ref(bolt)] })).toThrow();
  });
});

describe("Thopter Mechanic", () => {
  it("grows on the second card drawn each turn and leaves a Thopter as it dies", () => {
    const { game } = table();
    const mechanic = spawn(game, "Thopter Mechanic");
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    settle(game);
    expect(counters(game, mechanic)).toBe(1);
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    settle(game);
    expect(counters(game, mechanic)).toBe(1);
    destroy(game, mechanic);
    expect(tokensNamed(game, "Thopter Token", A)).toBe(1);
  });
});

describe("Misery's Shadow", () => {
  it("exiles an opponent's dying creature, not yours, and pumps for {1}", () => {
    const { game } = table();
    const shadow = spawn(game, "Misery's Shadow");
    const theirs = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears");
    destroy(game, theirs);
    destroy(game, mine);
    expect(zone(game, theirs)).toBe("exile");
    expect(zone(game, mine)).toBe("graveyard");
    lands(game, "Wastes", 2);
    activate(game, shadow);
    activate(game, shadow);
    expect(pt(game, shadow)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Hoarding Recluse", () => {
  it("as it dies, puts another card from any graveyard on the bottom of its owner's library", () => {
    const { game, a } = table();
    const recluse = spawn(game, "Hoarding Recluse");
    const theirs = toGraveyard(game, "Lightning Bolt", B);
    const seen = watchTargets(a, () => [theirs]);
    destroy(game, recluse);
    expect(seen.asked).toBe(1);
    // "Other": not the Recluse itself.
    expect(seen.offered[0]).toContain(theirs);
    expect(seen.offered[0]).not.toContain(recluse);
    expect(zone(game, theirs)).toBe("library");
    const library = game.state.zones.perPlayer[B].library;
    expect(library[library.length - 1]).toBe(theirs);
    expect(zone(game, recluse)).toBe("graveyard");
  });
});

describe("Geology Enthusiast", () => {
  it("makes a tapped Powerstone at your end step, and {6} draws and grows it", () => {
    const { game } = table();
    const enthusiast = spawn(game, "Geology Enthusiast");
    toStep(game, "end");
    settle(game);
    const stones = named(game, "Powerstone Token", A);
    expect(stones).toHaveLength(1);
    expect(isTapped(game, stones[0])).toBe(true);
    nextTurn(game);
    nextTurn(game);
    lands(game, "Wastes", 6);
    const before = hand(game).length;
    activate(game, enthusiast);
    expect(hand(game).length).toBe(before + 1);
    expect(counters(game, enthusiast)).toBe(1);
  });
});

describe("Repair and Recharge", () => {
  it("returns an enchantment card from your graveyard and makes a tapped Powerstone", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    const ring = toGraveyard(game, "Sol Ring");
    const bears = toGraveyard(game, "Grizzly Bears");
    cast(game, toHand(game, "Repair and Recharge"), { targets: [ref(ring)] });
    expect(zone(game, ring)).toBe("battlefield");
    expect(zone(game, bears)).toBe("graveyard");
    const stones = named(game, "Powerstone Token", A);
    expect(stones).toHaveLength(1);
    expect(isTapped(game, stones[0])).toBe(true);
  });

  it("can't target a creature card", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    const bears = toGraveyard(game, "Grizzly Bears");
    expect(() => cast(game, toHand(game, "Repair and Recharge"), { targets: [ref(bears)] })).toThrow();
  });
});

describe("Disciples of Gix", () => {
  it("puts up to three artifact cards from your library into your graveyard", () => {
    const { game, a } = table();
    const rings = [toLibrary(game, "Sol Ring"), toLibrary(game, "Sol Ring"), toLibrary(game, "Sol Ring")];
    toLibrary(game, "Sol Ring");
    const bears = toLibrary(game, "Grizzly Bears");
    const seen = pickFromZone(a, ...rings);
    enter(game, "Disciples of Gix");
    expect(seen.offered).not.toContain(bears);
    for (const ring of rings) expect(zone(game, ring)).toBe("graveyard");
    expect(graveyard(game).filter((id) => game.state.objects[id].cardName === "Sol Ring")).toHaveLength(3);
  });
});

describe("Fallaji Archaeologist", () => {
  it("takes a milled noncreature, nonland card, or else gets a counter", () => {
    const { game, a } = table();
    toLibrary(game, "Grizzly Bears");
    const bolt = toLibrary(game, "Lightning Bolt");
    toLibrary(game, "Forest");
    pickModes(a, 0);
    const seen = pickFromZone(a, bolt);
    const archaeologist = enter(game, "Fallaji Archaeologist");
    expect(seen.offered).toEqual([bolt]);
    expect(zone(game, bolt)).toBe("hand");
    expect(counters(game, archaeologist)).toBe(0);
  });

  it("with only creatures and lands milled, gets the counter", () => {
    const { game, a } = table();
    toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Forest");
    toLibrary(game, "Hill Giant");
    pickModes(a, 0);
    const archaeologist = enter(game, "Fallaji Archaeologist");
    expect(counters(game, archaeologist)).toBe(1);
  });
});

describe("Airlift Chaplain", () => {
  it("may take a milled Plains or a creature card of mana value 3 or less, not a bigger creature", () => {
    const { game, a } = table();
    const giant = toLibrary(game, "Craw Wurm");
    const plains = toLibrary(game, "Plains");
    const bears = toLibrary(game, "Grizzly Bears");
    pickModes(a, 0);
    const seen = pickFromZone(a, bears);
    const chaplain = enter(game, "Airlift Chaplain");
    expect([...seen.offered].sort()).toEqual([plains, bears].sort());
    expect(seen.offered).not.toContain(giant);
    expect(zone(game, bears)).toBe("hand");
    expect(counters(game, chaplain)).toBe(0);
  });

  it("declining gives it a +1/+1 counter", () => {
    const { game, a } = table();
    toLibrary(game, "Plains");
    toLibrary(game, "Plains");
    toLibrary(game, "Plains");
    pickModes(a);
    const chaplain = enter(game, "Airlift Chaplain");
    expect(counters(game, chaplain)).toBe(1);
  });

  it("can still take a milled card a Rest in Peace exiled (rule 701.17c)", () => {
    const { game, a } = table();
    spawn(game, "Rest in Peace", B);
    const plains = toLibrary(game, "Plains");
    toLibrary(game, "Craw Wurm");
    toLibrary(game, "Craw Wurm");
    pickModes(a, 0);
    pickFromZone(a, plains);
    const chaplain = enter(game, "Airlift Chaplain");
    expect(zone(game, plains)).toBe("hand");
    expect(counters(game, chaplain)).toBe(0);
  });
});

describe("Levitating Statue", () => {
  it("grows on noncreature spells and animates as a 1/1 Construct plus its counters", () => {
    const { game } = table();
    const statue = spawn(game, "Levitating Statue");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(counters(game, statue)).toBe(1);
    lands(game, "Wastes", 2);
    activate(game, statue);
    expect(game.characteristics(statue).types).toContain("creature");
    expect(game.characteristics(statue).subtypes).toContain("Construct");
    expect(pt(game, statue)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, statue).has("flying")).toBe(true);
  });
});

describe("Take Flight", () => {
  it("gives +1/+0, flying, and a draw whenever the creature attacks", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 4);
    cast(game, toHand(game, "Take Flight"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, bears).has("flying")).toBe(true);
    const before = hand(game).length;
    attack(game, a, [bears]);
    expect(hand(game).length).toBe(before + 1);
    expect(life(game, B)).toBe(17);
  });
});

describe("Zephyr Sentinel", () => {
  it("returns a Soldier and gets a counter", () => {
    const { game, a } = table();
    const soldier = spawn(game, "Zephyr Sentinel");
    pickTargets(a, soldier);
    const sentinel = enter(game, "Zephyr Sentinel");
    expect(zone(game, soldier)).toBe("hand");
    expect(counters(game, sentinel)).toBe(1);
  });

  it("returns a non-Soldier without a counter, and may return nothing", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    const sentinel = enter(game, "Zephyr Sentinel");
    expect(zone(game, bears)).toBe("hand");
    expect(counters(game, sentinel)).toBe(0);
    pickTargets(a, null);
    const second = enter(game, "Zephyr Sentinel");
    expect(counters(game, second)).toBe(0);
  });
});

describe("Hero of the Dunes", () => {
  it("returns a small artifact or creature card, and pumps creatures you control of mana value 3 or less", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    const giant = spawn(game, "Craw Wurm");
    const theirs = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const hero = enter(game, "Hero of the Dunes");
    expect(zone(game, bears)).toBe("battlefield");
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, giant)).toEqual({ power: 6, toughness: 4 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
    // Its own mana value is 5.
    expect(pt(game, hero)).toEqual({ power: 3, toughness: 2 });
  });

  it("can't return a card of mana value 4 or more", () => {
    const { game, a } = table();
    const wurm = toGraveyard(game, "Craw Wurm");
    const ring = toGraveyard(game, "Sol Ring");
    const bears = toGraveyard(game, "Grizzly Bears");
    const seen = watchTargets(a, () => [ring]);
    enter(game, "Hero of the Dunes");
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toContain(ring);
    expect(seen.offered[0]).toContain(bears);
    expect(seen.offered[0]).not.toContain(wurm);
    expect(zone(game, ring)).toBe("battlefield");
  });
});

describe("Powerstone Fracture", () => {
  it("sacrifices an artifact or creature as it's cast and destroys a creature or planeswalker", () => {
    const { game } = table();
    const ring = spawn(game, "Sol Ring");
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Powerstone Fracture"), { targets: [ref(giant)], sacrifice: ring });
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Sibling Rivalry", () => {
  it("steals an artifact or creature until end of turn, untapped and hasty, and makes a tapped Powerstone", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B, { tapped: true });
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Sibling Rivalry"), { targets: [ref(giant)] });
    expect(controller(game, giant)).toBe(A);
    expect(isTapped(game, giant)).toBe(false);
    expect(keywords(game, giant).has("haste")).toBe(true);
    const stones = named(game, "Powerstone Token", A);
    expect(stones).toHaveLength(1);
    expect(isTapped(game, stones[0])).toBe(true);
    nextTurn(game);
    expect(controller(game, giant)).toBe(B);
  });
});

describe("Great Desert Prospector", () => {
  it("makes a tapped Powerstone for each other creature you control", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    enter(game, "Great Desert Prospector");
    const stones = named(game, "Powerstone Token", A);
    expect(tokensNamed(game, "Powerstone Token", A)).toBe(2);
    for (const stone of stones) expect(isTapped(game, stone)).toBe(true);
  });
});

describe("Involuntary Cooldown", () => {
  it("taps up to two artifacts and/or creatures with two stun counters each", () => {
    const { game } = table();
    const ring = spawn(game, "Sol Ring", B);
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Island", 4);
    cast(game, toHand(game, "Involuntary Cooldown"), { targets: [ref(ring), ref(giant)] });
    for (const id of [ring, giant]) {
      expect(isTapped(game, id)).toBe(true);
      expect(counters(game, id, "stun")).toBe(2);
    }
    // Bob's untap step takes a stun counter instead of untapping.
    nextTurn(game);
    expect(isTapped(game, giant)).toBe(true);
    expect(counters(game, giant, "stun")).toBe(1);
  });
});

describe("Fallaji Dragon Engine", () => {
  it("cast prototyped is a red 1/3 flier that pumps for {2}", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const engine = toHand(game, "Fallaji Dragon Engine");
    cast(game, engine, { prototype: true });
    expect(pt(game, engine)).toEqual({ power: 1, toughness: 3 });
    expect(colorsOf(game, engine)).toEqual(["R"]);
    expect(keywords(game, engine).has("flying")).toBe(true);
    activate(game, engine);
    expect(pt(game, engine)).toEqual({ power: 2, toughness: 3 });
  });
});

describe("Iron-Craw Crusher", () => {
  it("as it attacks, gives an attacking creature +X/+0 where X is its power", () => {
    const { game, a } = table();
    const crusher = spawn(game, "Iron-Craw Crusher");
    const bears = spawn(game, "Grizzly Bears");
    const seen = watchTargets(a, () => [bears]);
    attack(game, a, [crusher, bears]);
    // Any attacking creature, the Crusher included.
    expect(seen.offered[0]).toContain(crusher);
    expect(seen.offered[0]).toContain(bears);
    // 4 + 6 combat damage.
    expect(life(game, B)).toBe(20 - 4 - 6);
  });

  it("prototyped, X is its 2 power", () => {
    const { game, a } = table();
    lands(game, "Forest", 4);
    const crusher = toHand(game, "Iron-Craw Crusher");
    cast(game, crusher, { prototype: true });
    expect(pt(game, crusher)).toEqual({ power: 2, toughness: 5 });
    game.state.objects[crusher].summoningSick = false;
    pickTargets(a, crusher);
    attack(game, a, [crusher]);
    expect(life(game, B)).toBe(16);
  });
});

describe("Arcane Proxy", () => {
  it("cast prototyped, copies an instant or sorcery of mana value 2 or less from your graveyard", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const bolt = toGraveyard(game, "Lightning Bolt");
    const divination = toGraveyard(game, "Divination");
    const opt = toGraveyard(game, "Opt");
    const giant = toGraveyard(game, "Hill Giant");
    // Not offered: Divination (3), Hill Giant (a creature).
    let offered: readonly ObjectId[] = [];
    a.chooseTargetsFn = (_v, _n, _specs, options) => {
      offered = options[0].map((t) => (t.kind === "object" ? t.object : (t.player as unknown as ObjectId)));
      return [ref(bolt)];
    };
    a.chooseCastNowFn = (_view, offer) => {
      const way = offer.casts[0];
      if (way === undefined) return null;
      return {
        type: "cast-spell",
        player: A,
        card: way.card,
        targets: [ref(B)],
        via: way.via,
        ...(offer.free ? { free: true } : {}),
      };
    };
    const proxy = toHand(game, "Arcane Proxy");
    cast(game, proxy, { prototype: true });
    expect(pt(game, proxy)).toEqual({ power: 2, toughness: 1 });
    expect(offered).toContain(bolt);
    expect(offered).toContain(opt);
    expect(offered).not.toContain(divination);
    expect(offered).not.toContain(giant);
    expect(zone(game, bolt)).toBe("exile");
    expect(life(game, B)).toBe(17);
  });

  it("does nothing when it enters without being cast", () => {
    const { game, a } = table();
    const bolt = toGraveyard(game, "Lightning Bolt");
    const seen = watchTargets(a, () => [bolt]);
    enter(game, "Arcane Proxy");
    expect(seen.asked).toBe(0);
    expect(zone(game, bolt)).toBe("graveyard");
  });
});

describe("Artificer's Dragon", () => {
  it("{R} pumps artifact creatures you control, and it unearths", () => {
    const { game } = table();
    const dragon = spawn(game, "Artificer's Dragon");
    const thopter = spawn(game, "Ornithopter");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 1);
    activate(game, dragon, 0);
    expect(pt(game, dragon)).toEqual({ power: 5, toughness: 4 });
    expect(pt(game, thopter)).toEqual({ power: 1, toughness: 2 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });

    destroy(game, dragon);
    expect(zone(game, dragon)).toBe("graveyard");
    nextTurn(game);
    nextTurn(game);
    lands(game, "Mountain", 5);
    activate(game, dragon, 1);
    expect(zone(game, dragon)).toBe("battlefield");
    expect(keywords(game, dragon).has("haste")).toBe(true);
    toStep(game, "end");
    settle(game);
    expect(zone(game, dragon)).toBe("exile");
  });
});

describe("Terror Ballista", () => {
  it("may sacrifice another creature as it attacks to destroy an opponent's creature", () => {
    const { game, a } = table();
    const ballista = spawn(game, "Terror Ballista");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    a.chooseSacrificesFn = (_view, eligible) => {
      expect(eligible).not.toContain(ballista);
      return [bears];
    };
    pickTargets(a, giant);
    pickModes(a, 0);
    attack(game, a, [ballista]);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, ballista)).toBe("battlefield");
  });
});

describe("Tower Worker, Mine Worker", () => {
  // Power Plant Worker is another card of the set; a stand-in of that name
  // when the pool doesn't have it yet.
  const registry = createDefaultRegistry();
  if (!registry.has("Power Plant Worker")) {
    registry.register(
      defineCard({
        name: "Power Plant Worker",
        manaCost: "{5}",
        types: ["artifact", "creature"],
        subtypes: ["Assembly-Worker"],
        power: 4,
        toughness: 4,
        text: "",
      }),
    );
  }
  const mk = (): { game: Game; a: ScriptedController } => {
    const a = new ScriptedController(A);
    const b = new ScriptedController(B);
    const game = Game.create({
      seed: 1,
      shuffle: false,
      registry,
      startingPlayer: A,
      rules: { skipFirstDraw: false, maxLandsPerTurn: 99, maxHandSize: 99 },
      controllers: { [A]: a, [B]: b },
      decks: [A, B].map((player) => ({ player, cards: Array<string>(40).fill("Wastes") })),
    });
    game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "precombat-main" && s.priority.holder === A);
    return { game, a };
  };
  const pool = (game: Game): number => game.state.players[A].manaPool.length;

  it("Tower Worker adds {C}, or {C}{C}{C} with a Mine Worker and a Power Plant Worker", () => {
    const { game } = mk();
    const tower = spawn(game, "Tower Worker");
    activate(game, tower);
    expect(pool(game)).toBe(1);
    const second = spawn(game, "Tower Worker");
    spawn(game, "Mine Worker");
    spawn(game, "Power Plant Worker", B);
    activate(game, second);
    // Bob's Power Plant Worker doesn't count.
    expect(pool(game)).toBe(2);
    const third = spawn(game, "Tower Worker");
    spawn(game, "Power Plant Worker");
    activate(game, third);
    expect(pool(game)).toBe(5);
  });

  it("Mine Worker gains 1 life, or 3 with a Power Plant Worker and a Tower Worker", () => {
    const { game } = mk();
    const mine = spawn(game, "Mine Worker");
    activate(game, mine);
    expect(life(game)).toBe(21);
    const second = spawn(game, "Mine Worker");
    spawn(game, "Power Plant Worker");
    spawn(game, "Tower Worker");
    activate(game, second);
    expect(life(game)).toBe(24);
  });
});

describe("Kayla's Reconstruction", () => {
  it("puts up to X artifact and/or creature cards of mana value 3 or less from the top seven onto the battlefield", () => {
    const { game, a } = table();
    lands(game, "Plains", 5);
    const wurm = toLibrary(game, "Craw Wurm");
    const ring = toLibrary(game, "Sol Ring");
    const bolt = toLibrary(game, "Lightning Bolt");
    const bears = toLibrary(game, "Grizzly Bears");
    const seen = pickFromZone(a, bears, ring);
    cast(game, toHand(game, "Kayla's Reconstruction"), { x: 2 });
    expect(seen.offered).toContain(bears);
    expect(seen.offered).toContain(ring);
    expect(seen.offered).not.toContain(wurm);
    expect(seen.offered).not.toContain(bolt);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, ring)).toBe("battlefield");
    // The rest went to the bottom.
    const library = game.state.zones.perPlayer[A].library;
    expect(library.slice(-5)).toContain(bolt);
    expect(library.slice(-5)).toContain(wurm);
  });
});

describe("Surge Engine", () => {
  it("loses defender for good and can't be blocked; then turns blue 5/4; then draws three once", () => {
    const { game } = table();
    const engine = spawn(game, "Surge Engine");
    lands(game, "Island", 12);
    // Defender: the second and third abilities aren't available yet.
    expect(canActivate(game, engine, 1)).toBe(false);
    expect(canActivate(game, engine, 2)).toBe(false);
    activate(game, engine, 0);
    expect(keywords(game, engine).has("defender")).toBe(false);
    expect(keywords(game, engine).has("unblockable")).toBe(true);
    expect(canActivate(game, engine, 2)).toBe(false);
    activate(game, engine, 1);
    expect(colorsOf(game, engine)).toEqual(["U"]);
    expect(pt(game, engine)).toEqual({ power: 5, toughness: 4 });
    const before = hand(game).length;
    activate(game, engine, 2);
    expect(hand(game).length).toBe(before + 3);
    // Only once.
    expect(canActivate(game, engine, 2)).toBe(false);
    // None of it wears off.
    nextTurn(game);
    expect(keywords(game, engine).has("defender")).toBe(false);
    expect(pt(game, engine)).toEqual({ power: 5, toughness: 4 });
    expect(colorsOf(game, engine)).toEqual(["U"]);
  });

  it("its last ability needs blue however it got there, and resets on a new object", () => {
    const { game } = table();
    const engine = spawn(game, "Surge Engine");
    lands(game, "Island", 12);
    game.debugApplyEffect(
      A,
      {
        kind: "animate",
        target: 0,
        power: 3,
        toughness: 2,
        addTypes: [],
        addSubtypes: [],
        setColors: ["U"],
        duration: "end-of-turn",
      },
      [ref(engine)],
    );
    expect(canActivate(game, engine, 2)).toBe(true);
    activate(game, engine, 2);
    expect(canActivate(game, engine, 2)).toBe(false);
  });
});

describe("Feldon, Ronom Excavator", () => {
  it("can't block, and exiles that many cards when dealt damage, one of them playable", () => {
    const { game, a } = table();
    const feldon = spawn(game, "Feldon, Ronom Excavator");
    const first = toLibrary(game, "Lightning Bolt");
    const second = toLibrary(game, "Lightning Bolt");
    const third = toLibrary(game, "Lightning Bolt");
    pickFromZone(a, second);
    damage(game, feldon, 1);
    // One damage: just the top card.
    expect(zone(game, third)).toBe("exile");
    expect(zone(game, second)).toBe("library");
    lands(game, "Mountain", 1);
    expect(canCast(game, third)).toBe(true);
    // Two damage: two cards, and only the chosen one is playable.
    pickFromZone(a, first);
    damage(game, feldon, 2);
    expect(zone(game, feldon)).toBe("graveyard");
    expect(zone(game, second)).toBe("exile");
    expect(zone(game, first)).toBe("exile");
    expect(canCast(game, first)).toBe(true);
    expect(canCast(game, second)).toBe(false);
  });

  it("isn't offered as a blocker", () => {
    const { game, b } = table();
    nextTurn(game);
    const feldon = spawn(game, "Feldon, Ronom Excavator", A);
    const bears = spawn(game, "Grizzly Bears", A);
    const giant = spawn(game, "Hill Giant", B);
    const offer = blockOffer(game, b, [giant], A);
    const blockers = offer.eligible.map((e) => e.blocker);
    expect(blockers).toContain(bears);
    expect(blockers).not.toContain(feldon);
  });
});
