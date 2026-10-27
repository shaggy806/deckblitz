import { describe, expect, it } from "vitest";
import {
  A,
  B,
  C,
  activate,
  cast,
  enter,
  nextTurn,
  pickFromZone,
  pickTargets,
  hand,
  keywords,
  lands,
  life,
  named,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

/**
 * Two Prophecy mechanics (batch 222):
 *
 * - "Any player may activate this ability" (rule 602.2 — "unless the object
 *   specifically says otherwise"): `ActivatedAbility.anyPlayer`. Whoever
 *   activates it controls the ability (602.2a), pays its costs, and is "you"
 *   in it and in its activation condition.
 * - "Unless any player pays {N}" (the rhystic cards): `unless` with
 *   `chooser: "any-player"`, each player asked from the active player in turn
 *   order (the rulings), the next only once the one before declines; and
 *   Browbeat's "any player may have ~ deal N damage to them" (`takeDamage`).
 */

describe("any player may activate", () => {
  it("lets an opponent activate it, paying with their own mana", () => {
    const { game } = table();
    const snake = spawn(game, "Ribbon Snake");
    const bobs = lands(game, "Island", 2, B);
    game.dispatch({ type: "pass-priority", player: A });
    expect(game.state.priority.holder).toBe(B);
    activate(game, snake, 0, { player: B });
    expect(keywords(game, snake).has("flying")).toBe(false);
    for (const land of bobs) expect(game.state.objects[land].tapped).toBe(true);
  });

  it("is offered among the opponent's legal actions, and an ordinary ability isn't", () => {
    const { game } = table();
    const snake = spawn(game, "Ribbon Snake");
    const shade = spawn(game, "Nakaya Shade");
    lands(game, "Swamp", 3, B);
    game.dispatch({ type: "pass-priority", player: A });
    const sources = game
      .legalActions(B)
      .flatMap((a) => (a.kind === "activate-ability" ? [a.source] : []));
    expect(sources).toContain(snake);
    expect(sources).not.toContain(shade);
  });

  it("has the activator sacrifice their own land and draw (Excavation)", () => {
    const { game } = table();
    const excavation = spawn(game, "Excavation");
    const [bobLand] = lands(game, "Island", 2, B);
    lands(game, "Island", 1, A);
    game.dispatch({ type: "pass-priority", player: A });
    const before = hand(game, B).length;
    const aliceHand = hand(game, A).length;
    game.dispatch({
      type: "activate-ability",
      player: B,
      source: excavation,
      abilityIndex: 0,
      targets: [],
      sacrifice: bobLand,
    });
    settle(game);
    expect(zone(game, bobLand)).toBe("graveyard");
    expect(hand(game, B).length).toBe(before + 1);
    expect(hand(game, A).length).toBe(aliceHand);
  });

  it("reads 'only as a sorcery' as the activator's main phase (Task Mage Assembly)", () => {
    const { game } = table();
    const assembly = spawn(game, "Task Mage Assembly");
    const bear = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 2, B);
    game.dispatch({ type: "pass-priority", player: A });
    // Alice's main phase, not Bob's: refused.
    expect(game.canDispatch({ type: "activate-ability", player: B, source: assembly, abilityIndex: 0, targets: [ref(bear)] })).not.toBeNull();
  });

  it("reads 'during their draw step' as the activator's (Well of Knowledge)", () => {
    const { game } = table({ step: "draw" });
    const well = spawn(game, "Well of Knowledge", B);
    lands(game, "Island", 2, A);
    const before = hand(game, A).length;
    // Alice's draw step, on Bob's Well: Alice may.
    activate(game, well, 0, { player: A });
    expect(hand(game, A).length).toBe(before + 1);
  });
});

describe("any player may activate: costs and triggers", () => {
  it("has the activator pay the life (Aether Storm)", () => {
    const { game } = table();
    const storm = spawn(game, "Aether Storm");
    game.dispatch({ type: "pass-priority", player: A });
    activate(game, storm, 0, { player: B });
    expect(zone(game, storm)).toBe("graveyard");
    expect(life(game, B)).toBe(16);
    expect(life(game, A)).toBe(20);
  });

  it("sacrifices Deadly Designs at five plot counters, its controller destroying up to two creatures", () => {
    const t = table();
    const { game } = t;
    const designs = spawn(game, "Deadly Designs");
    const bear = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 2, B);
    game.state.objects[designs].counters.plot = 4;
    pickTargets(t.a, bear, null);
    game.dispatch({ type: "pass-priority", player: A });
    activate(game, designs, 0, { player: B });
    expect(zone(game, designs)).toBe("graveyard");
    expect(zone(game, bear)).toBe("graveyard");
  });
});

describe("unless any player pays", () => {
  it("happens when no one pays (Rhystic Tutor)", () => {
    const t = table();
    const { game } = t;
    lands(game, "Swamp", 3);
    lands(game, "Swamp", 2, B);
    const wanted = game.debugSpawn("Lightning Bolt", A, "library");
    pickFromZone(t.a, wanted);
    cast(game, toHand(game, "Rhystic Tutor"));
    expect(zone(game, wanted)).toBe("hand");
  });

  it("doesn't happen when the opponent pays (Rhystic Tutor)", () => {
    const t = table();
    const { game } = t;
    lands(game, "Swamp", 3);
    lands(game, "Swamp", 2, B);
    const wanted = game.debugSpawn("Lightning Bolt", A, "library");
    pickFromZone(t.a, wanted);
    pickModes(t.b, 0);
    cast(game, toHand(game, "Rhystic Tutor"));
    expect(zone(game, wanted)).toBe("library");
  });

  it("asks the active player first, then the next in turn order, and stops at the first who pays", () => {
    const t = table({ players: 3 });
    const { game } = t;
    lands(game, "Forest", 2);
    lands(game, "Forest", 2, B);
    lands(game, "Forest", 2, C);
    const bear = spawn(game, "Grizzly Bears");
    const asked: string[] = [];
    t.a.chooseModesFn = () => {
      asked.push("alice");
      return [];
    };
    t.b.chooseModesFn = () => {
      asked.push("bob");
      return [0];
    };
    t.c.chooseModesFn = () => {
      asked.push("carol");
      return [0];
    };
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Wild Might"), { targets: [ref(bear)] });
    expect(asked).toEqual(["alice", "bob"]);
    expect(pt(game, bear)).toEqual({ power: 3, toughness: 3 });
  });

  it("happens when everyone declines", () => {
    const { game } = table({ players: 3 });
    lands(game, "Forest", 2);
    lands(game, "Forest", 2, B);
    const bear = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Wild Might"), { targets: [ref(bear)] });
    expect(pt(game, bear)).toEqual({ power: 7, toughness: 7 });
  });

  it("skips a player who can't pay", () => {
    const t = table();
    const { game } = t;
    lands(game, "Forest", 2);
    const bear = spawn(game, "Grizzly Bears");
    let bobAsked = false;
    t.b.chooseModesFn = () => {
      bobAsked = true;
      return [0];
    };
    cast(game, toHand(game, "Wild Might"), { targets: [ref(bear)] });
    expect(bobAsked).toBe(false);
    expect(pt(game, bear)).toEqual({ power: 7, toughness: 7 });
  });

  it("reads Soul Strings' {X} as the spell's X", () => {
    const t = table();
    const { game } = t;
    lands(game, "Swamp", 3);
    lands(game, "Swamp", 2, B);
    const one = game.debugSpawn("Grizzly Bears", A, "graveyard");
    const two = game.debugSpawn("Hill Giant", A, "graveyard");
    pickModes(t.b, 0);
    cast(game, toHand(game, "Soul Strings"), { x: 2, targets: [ref(one), ref(two)] });
    // Bob paid {2}: both stay.
    expect(zone(game, one)).toBe("graveyard");
    expect(zone(game, two)).toBe("graveyard");
    expect(named(game, "Swamp", B).every((id) => game.state.objects[id].tapped)).toBe(true);
  });

  it("sacrifices Icy Prison at upkeep unless someone pays, returning the exiled creature", () => {
    const t = table();
    const { game } = t;
    const bear = spawn(game, "Grizzly Bears", B);
    pickTargets(t.a, bear);
    const prison = enter(game, "Icy Prison");
    expect(zone(game, bear)).toBe("exile");
    nextTurn(game); // Bob's
    nextTurn(game); // Alice's: her upkeep asked, and nobody could pay
    expect(zone(game, prison)).toBe("graveyard");
    expect(named(game, "Grizzly Bears", B).length).toBe(1);
  });
});

describe("any player may have it deal damage to them", () => {
  it("draws three when no one takes the damage (Browbeat)", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const before = hand(game, A).length;
    cast(game, toHand(game, "Browbeat"), { targets: [ref(A)] });
    expect(hand(game, A).length).toBe(before + 3);
  });

  it("draws nothing when a player takes the damage, and the spell deals it", () => {
    const t = table();
    const { game } = t;
    lands(game, "Mountain", 3);
    pickModes(t.b, 0);
    const before = hand(game, A).length;
    cast(game, toHand(game, "Browbeat"), { targets: [ref(A)] });
    expect(hand(game, A).length).toBe(before);
    expect(life(game, B)).toBe(15);
  });

  it("destroys every creature unless someone takes 6 (Breaking Point)", () => {
    const t = table();
    const { game } = t;
    lands(game, "Mountain", 3);
    const bear = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Breaking Point"));
    expect(zone(game, bear)).toBe("graveyard");
  });
});
