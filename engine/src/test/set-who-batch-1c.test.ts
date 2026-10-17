/**
 * Doctor Who (WHO), batch 1, part c (2026-10-17): Paradox, casting from
 * places other than the hand, foretell and flashback. Written on the shared
 * table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  attack,
  blockOffer,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickModes,
  pickTargets,
  settle,
  spawn,
  supertypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const copies = (game: ReturnType<typeof table>["game"]): number => game.eventsOfType("spell-copied").length;

describe("Memory Worm", () => {
  it("paradox: 2 damage to the target player, who discards then draws; then a +1/+1 counter — not for a spell from the hand", () => {
    const { game, a } = table();
    const worm = spawn(game, "Memory Worm");
    lands(game, "Island", 4);
    const opt = toHand(game, "Opt");
    pickTargets(a, B);
    cast(game, opt);
    expect(life(game, B)).toBe(20);
    expect(counters(game, worm)).toBe(0);

    const bHand = hand(game, B).length;
    const bGraveyard = graveyard(game, B).length;
    cast(game, toGraveyard(game, "Think Twice"), { via: "flashback" });
    expect(life(game, B)).toBe(18);
    expect(hand(game, B)).toHaveLength(bHand);
    expect(graveyard(game, B)).toHaveLength(bGraveyard + 1);
    expect(counters(game, worm)).toBe(1);
  });
});

describe("Impending Flux", () => {
  it("X is 1 plus the spells you cast from anywhere but your hand this turn: to each opponent and their creatures only", () => {
    const { game } = table();
    lands(game, "Island", 3);
    lands(game, "Mountain", 3);
    const mine = spawn(game, "Grizzly Bears");
    const bears = spawn(game, "Grizzly Bears", B);
    const wurm = spawn(game, "Craw Wurm", B);
    cast(game, toGraveyard(game, "Think Twice"), { via: "flashback" });
    cast(game, toHand(game, "Impending Flux"));
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(20);
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[wurm].damageMarked).toBe(2);
    expect(zone(game, mine)).toBe("battlefield");
    expect(game.state.objects[mine].damageMarked).toBe(0);
  });

  it("cast foretold from exile, it counts itself (the ruling)", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const flux = toHand(game, "Impending Flux");
    game.dispatch({ type: "foretell", player: A, card: flux });
    expect(zone(game, flux)).toBe("exile");
    toStep(game, "precombat-main");
    cast(game, flux, { via: "foretell" });
    expect(life(game, B)).toBe(18);
  });
});

describe("Sisterhood of Karn", () => {
  it("enters with a +1/+1 counter and doubles its +1/+1 counters on each paradox", () => {
    const { game } = table();
    const sisters = enter(game, "Sisterhood of Karn");
    expect(counters(game, sisters)).toBe(1);
    lands(game, "Island", 7);
    cast(game, toGraveyard(game, "Think Twice"), { via: "flashback" });
    expect(counters(game, sisters)).toBe(2);
    cast(game, toGraveyard(game, "Think Twice"), { via: "flashback" });
    expect(counters(game, sisters)).toBe(4);
    cast(game, toHand(game, "Opt"));
    expect(counters(game, sisters)).toBe(4);
  });
});

describe("Osgood, Operation Double", () => {
  it("casting it makes a nonlegendary token copy; each investigates on a paradox", () => {
    const { game } = table();
    lands(game, "Island", 7);
    const osgood = toHand(game, "Osgood, Operation Double");
    cast(game, osgood);
    const both = named(game, "Osgood, Operation Double", A);
    expect(both).toHaveLength(2);
    const token = both.find((id) => game.state.objects[id].isToken)!;
    expect(token).toBeDefined();
    expect(zone(game, osgood)).toBe("battlefield");
    expect(supertypes(game, osgood)).toContain("legendary");
    expect(supertypes(game, token)).not.toContain("legendary");
    cast(game, toGraveyard(game, "Think Twice"), { via: "flashback" });
    expect(tokensNamed(game, "Clue Token", A)).toBe(2);
  });
});

describe("The Twelfth Doctor", () => {
  it("only the first spell from anywhere but the hand each turn has demonstrate; your copy counts, theirs doesn't", () => {
    const { game, a } = table();
    const doctor = spawn(game, "The Twelfth Doctor");
    lands(game, "Island", 7);
    pickModes(a, 0); // copy whenever asked
    cast(game, toHand(game, "Opt"));
    expect(copies(game)).toBe(0);

    const bHand = hand(game, B).length;
    cast(game, toGraveyard(game, "Think Twice"), { via: "flashback" });
    const copied = game.eventsOfType("spell-copied");
    expect(copied).toHaveLength(2);
    expect(copied.map((e) => e.controller).sort()).toEqual([A, B].sort());
    expect(hand(game, B)).toHaveLength(bHand + 1);
    expect(counters(game, doctor)).toBe(1);

    cast(game, toGraveyard(game, "Think Twice"), { via: "flashback" });
    expect(copies(game)).toBe(2);
    expect(counters(game, doctor)).toBe(1);
  });

  it("a spell cast from the graveyard before it arrived was that turn's first", () => {
    const { game, a } = table();
    lands(game, "Island", 6);
    pickModes(a, 0);
    cast(game, toGraveyard(game, "Think Twice"), { via: "flashback" });
    spawn(game, "The Twelfth Doctor");
    cast(game, toGraveyard(game, "Think Twice"), { via: "flashback" });
    expect(copies(game)).toBe(0);
  });
});

describe("The Fugitive Doctor", () => {
  it("investigates; attacking, a sacrificed Clue gives an instant in your graveyard flashback {2}{R}{G} this turn", () => {
    const { game, a } = table();
    const doctor = enter(game, "The Fugitive Doctor");
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    const bolt = toGraveyard(game, "Lightning Bolt");
    lands(game, "Mountain", 2);
    lands(game, "Forest", 2);
    pickModes(a, 0);
    pickTargets(a, bolt);
    attack(game, a, [doctor]);
    expect(tokensNamed(game, "Clue Token", A)).toBe(0);
    expect(life(game, B)).toBe(16);
    pickTargets(a, B);
    cast(game, bolt, { via: "flashback", targets: [{ kind: "player", player: B }] });
    expect(life(game, B)).toBe(13);
    expect(zone(game, bolt)).toBe("exile");
  });

  it("declining the sacrifice grants nothing", () => {
    const { game, a } = table();
    const doctor = enter(game, "The Fugitive Doctor");
    const bolt = toGraveyard(game, "Lightning Bolt");
    lands(game, "Mountain", 4);
    pickModes(a);
    attack(game, a, [doctor]);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    expect(() => cast(game, bolt, { via: "flashback", targets: [{ kind: "player", player: B }] })).toThrow();
  });

  it("an {X} spell cast with that flashback has X = 0 (the ruling)", () => {
    const { game, a } = table();
    const doctor = enter(game, "The Fugitive Doctor");
    const blaze = toGraveyard(game, "Blaze");
    lands(game, "Mountain", 5);
    lands(game, "Forest", 2);
    pickModes(a, 0);
    pickTargets(a, blaze);
    attack(game, a, [doctor]);
    const before = life(game, B);
    let refused = false;
    try {
      cast(game, blaze, { via: "flashback", x: 3, targets: [{ kind: "player", player: B }] });
    } catch {
      refused = true;
    }
    if (!refused) expect(life(game, B)).toBe(before);
    else {
      cast(game, blaze, { via: "flashback", x: 0, targets: [{ kind: "player", player: B }] });
      expect(life(game, B)).toBe(before);
    }
  });
});

describe("Ryan Sinclair", () => {
  it("attacking, exiles to a nonland card and may cast it free if its mana value is at most Ryan's power", () => {
    const { game, a } = table();
    const ryan = spawn(game, "Ryan Sinclair");
    const bears = toLibrary(game, "Grizzly Bears");
    const wastes = toLibrary(game, "Wastes");
    a.chooseCastNowFn = (_v, offer) => {
      const way = offer.casts.find((c) => c.card === bears);
      return way === undefined
        ? null
        : { type: "cast-spell", player: A, card: bears, targets: [], via: way.via, ...(offer.free ? { free: true } : {}) };
    };
    attack(game, a, [ryan]);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, wastes)).toBe("library");
    const library = game.state.zones.perPlayer[A].library;
    expect(library.indexOf(wastes) === 0 || library.indexOf(wastes) === library.length - 1).toBe(true);
  });

  it("a card costing more than Ryan's power can't be cast, and goes to the bottom with the rest", () => {
    const { game, a } = table();
    const ryan = spawn(game, "Ryan Sinclair");
    const wurm = toLibrary(game, "Craw Wurm");
    let offeredCasts = -1;
    a.chooseCastNowFn = (_v, offer) => {
      offeredCasts = offer.casts.length;
      return null;
    };
    attack(game, a, [ryan]);
    expect(offeredCasts <= 0).toBe(true);
    expect(zone(game, wurm)).toBe("library");
    const library = game.state.zones.perPlayer[A].library;
    expect(library.indexOf(wurm) === 0 || library.indexOf(wurm) === library.length - 1).toBe(true);
    const top = game.state.zones.perPlayer[A].library;
    expect(top.length).toBeGreaterThan(1);
  });
});

describe("Wreck and Rebuild", () => {
  it("mills five, then may put a land card from the graveyard onto the battlefield tapped; flashback destroys an artifact", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    lands(game, "Forest", 4);
    let offered: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_v, eligible) => {
      offered = eligible;
      return [eligible[0]];
    };
    const wreck = toHand(game, "Wreck and Rebuild");
    cast(game, wreck, { modes: [1] });
    expect(offered).toHaveLength(5);
    expect(zone(game, offered[0])).toBe("battlefield");
    expect(game.state.objects[offered[0]].tapped).toBe(true);
    expect(zone(game, wreck)).toBe("graveyard");

    const ring = spawn(game, "Sol Ring", B);
    cast(game, wreck, { via: "flashback", modes: [0], targets: [{ kind: "object", object: ring }] });
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, wreck)).toBe("exile");
  });
});

describe("Frost Fair Lure Fish", () => {
  it("makes two Fish and two tapped Treasures; Fish you control have haste and can't be blocked by Humans", () => {
    const { game, a } = table();
    const lure = enter(game, "Frost Fair Lure Fish");
    expect(tokensNamed(game, "Fish Token", A)).toBe(2);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(2);
    const treasures = named(game, "Treasure Token", A);
    expect(treasures.every((id) => game.state.objects[id].tapped)).toBe(true);
    const [fish] = named(game, "Fish Token", A);
    expect(keywords(game, fish).has("haste")).toBe(true);
    expect(keywords(game, lure).has("haste")).toBe(true);
    const bears = spawn(game, "Grizzly Bears");
    expect(keywords(game, bears).has("haste")).toBe(false);

    const human = spawn(game, "Elite Vanguard", B);
    const blocker = spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [lure]);
    const canBlock = (id: ObjectId): readonly ObjectId[] => offer.eligible.find((e) => e.blocker === id)?.canBlock ?? [];
    expect(canBlock(human)).not.toContain(lure);
    expect(canBlock(blocker)).toContain(lure);
    settle(game);
  });
});
